/*!
 * PEAK-PROTOTYPE
 * CORE GOOGLE MAPS JS Methods
 * Copyright 2013, Andrew Cobley
 */

// ##########################
// INIT GOOGLE MAPS VARIABLES

google.maps.visualRefresh = true;

var map;
var mapOp;
var leg;
var route;
var directionsService;
var directionsDisplay;
var directionsDisplayOp;
var directionsResponse;
var elevation_points;

var maptype_id = 'custom_style';

var marker_info;
var current_marker;

var initial_setup = false;
var new_route_listener;

var polyline_route = [];
var abmarkers = [];
var distance_markers = [];
var landmarks = [];

var new_marker_a = null;
var new_marker_a_label = "";
var new_marker_a_move;
var new_marker_a_click;
var new_marker_b = null;
var new_marker_b_label = "";
var new_marker_b_move;
var new_marker_b_click;

var styles = [
	{featureType:"all",elementType:"all",stylers:[{saturation:-50}]},
	{featureType:"transit",elementType:"all",stylers:[{visibility:"off"}]},
	{featureType:"road",elementType:"all",stylers:[{visibility:"on"}]},
	{featureType:"road.highway",elementType:"all",stylers:[{visibility:"on"}]},
	{featureType:"poi",elementType:"all",stylers:[{visibility:"on"}]}
];

function initialiseMap() 
{
	// SET MAP CENTER AND ZOOM LEVEL
	var i_center; var i_zoom;
	if(ex_route)
	{
		i_center = new google.maps.LatLng(ex_route.center.lat, ex_route.center.lng);	
		i_zoom = ex_route.zoom;
	}
	else
	{
		i_center = new google.maps.LatLng(51.541, -3.246);
		i_zoom = 12;
	}

	// SET MAP OPTIONS
	mapOp = {
		center: i_center,
		zoom: i_zoom,
		panControl: false,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
		},
		scaleControl: true,
		streetViewControl: false,
		mapTypeId: maptype_id
		//mapTypeId: google.maps.MapTypeId.TERRAIN
	};

	// SET MAP
	map = new google.maps.Map(document.getElementById("map"),mapOp);

	// STYLE MAP
	var styledMapOp = {
		name: 'Styled'
	};

	var customMapType = new google.maps.StyledMapType(styles, styledMapOp);

	map.mapTypes.set(maptype_id, customMapType);

	// INIT INSTANCE OF INFOWINDOW
	marker_info = new google.maps.InfoWindow();

	// ADD LISTENER FOR INFOWINDOW USE
	google.maps.event.addListener(marker_info, 'domready', function(e)
	{
		$('span#update').click(function(e)
		{
			var lab = $('input#title').val();
			current_marker._label = lab;
			updateMarkerInfo(current_marker,'info');
			markerUpdate();
		});

		$('span#edit').click(function(e)
		{
			updateMarkerInfo(current_marker,'edit');
		});
	});

	// INIT DIRECTION SERVICES

	directionsService = new google.maps.DirectionsService();

	directionsDisplayOp = {
		map: map,
		draggable: true,
		polylineOptions: {
      		strokeWeight: 5,
      		strokeColor: 'rgba(255,234,54,1.0)'
    	},
    	markerOptions: {
    		icon: f_url+'assets/icons/marker-blank-dark.png',
    		draggable: true
    	},
		hideRouteList: true,
		suppressInfoWindows: true,
		suppressBicyclingLayer: true,
		suppressMarkers: false
	};

	directionsDisplay = new google.maps.DirectionsRenderer(directionsDisplayOp);

	// ADD LISTENER FOR ROUTE DRAG CHANGE
	google.maps.event.addListener(directionsDisplay, 'directions_changed', function()
	{
		resetDistanceMarkers();
		var interval_points = getPointsAtIntervals(directionsDisplay.directions.routes[0].overview_path, 200);
		getElevationAtPoints(interval_points);
  	});

	// INIT EXAMPLE ROUTE
	if(ex_route)
	{
		new_marker_a_label = ex_route.origin.label;
		var from = new google.maps.LatLng(ex_route.origin.lat, ex_route.origin.lng);
		new_marker_b_label = ex_route.desination.label;
		var to = new google.maps.LatLng(ex_route.desination.lat, ex_route.desination.lng);
		
		var waypoints = [];
		for(var i = 0; i < ex_route.waypoints.length; i++)
		{
			var wp_lat = ex_route.waypoints[i].lat;
			var wp_lng = ex_route.waypoints[i].lng;
			waypoints.push({
				location: new google.maps.LatLng(wp_lat,wp_lng),
				stopover: false
			});
		}

		route = {
			origin: from,
			destination: to,
			waypoints: waypoints,
			provideRouteAlternatives: false,
			travelMode: google.maps.TravelMode.BICYCLING,
			unitSystem: google.maps.UnitSystem.METRIC
		};

		setDirectionsForRoute(route);
	}
}

// SET DIRECTIONS FOR GIVEN ROUTE
function setDirectionsForRoute(route)
{
	directionsService.route(route, function(response, status)
	{
    		if (status == google.maps.DirectionsStatus.OK)
		{
			directionsResponse = response;
      			directionsDisplay.setDirections(response);
    		}
  	});
}

// CREATE DISTANCE MARKERS ALONG ROUTE
function getPointsAtIntervals(path,interval)
{
	var intervals = [];
	var points = [];
	var current_interval = interval;
	var total_distance = 0;

	// SET INITIAL INTERVAL
	intervals.push(0);
	points.push(path[0]);

	// SET INITIAL POLYLINE TICK
	polyline_route.push([path[0],0]);
	var current_tick = 0;
	var tick_rate = 5;

	for(var i = 1; i < path.length; i++)
	{
		// UPDATE DISTANCE
		var d = google.maps.geometry.spherical.computeDistanceBetween(path[i-1],path[i]);
		total_distance += d;

		// FIND INTERVALS ON LINE
		while(total_distance > current_interval)	
		{
			// Interval point lies between current point and previous point.
			// - Work out LatLng for interval point.
			var p = 1 - ((total_distance - current_interval) / d);
			var new_lat = path[i-1].lat() + (p * (path[i].lat() - path[i-1].lat() ));
			var new_lng = path[i-1].lng() + (p * (path[i].lng() - path[i-1].lng() ));

			var point = new google.maps.LatLng(new_lat, new_lng);

			// Set current interval and point
			intervals.push(current_interval);
			points.push(point);

			// Create a map marker
			distance_markers.push(new google.maps.Marker({
				map: map,
				position: point,
    			icon: f_url+'assets/icons/marker-distance.png'
			}));

			// Update interval
			current_interval += interval;
		}

		// FIND POLYLINE TICKS ON LINE
		while(total_distance > current_tick)
		{
			// Polyline tick lies between current point and previous point.
			// - Work out LatLng for polyline tick.
			var p = 1 - ((total_distance - current_tick) / d);
			var new_lat = path[i-1].lat() + (p * (path[i].lat() - path[i-1].lat() ));
			var new_lng = path[i-1].lng() + (p * (path[i].lng() - path[i-1].lng() ));

			var point = new google.maps.LatLng(new_lat, new_lng);

			// Set current interval and point
			polyline_route.push([point,current_tick]);

			current_tick += tick_rate;
		}

	}

	// Set final point if not last interval
	if(total_distance !== current_interval)
	{
		intervals.push(Math.round(total_distance));
		points.push(path[path.length-1]);

		polyline_route.push([path[path.length-1],Math.round(total_distance)]);
	}

	var interval_points = [intervals,points];

	return interval_points;
}

// GET ELEVATION DATA FOR POINTS ALONG ROUTE
function getElevationAtPoints(interval_points)
{
	elevation_points = [];

	var elevator = new google.maps.ElevationService();

	var positionalRequest = {
    		'locations': interval_points[1]
  	};

	elevator.getElevationForLocations(positionalRequest, function(results, status)
	{
		console.log(results);
		if (status == google.maps.ElevationStatus.OK)
		{
			for(var i = 0; i < results.length; i++)
			{
				elevation_points.push([interval_points[0][i], results[i].elevation, interval_points[1][i]]);
			}

			console.log("Draw Elevation");

			prepareToDraw(elevation_points);
		}
		else
		{
			console.error(status);
		}
	});
}

// MAKE SURE INFORMATION IS AVAILBLE BEFORE DRAWING
function prepareToDraw(points)
{
	// CHECK DIRECTIONSDISPLAY HAS LOADED
	var dt = 0; var di = 50; var dmax = 10000;
	var timer = setInterval(function() 
	{
 		if(directionsDisplay.b.b.length !== 0)
		{
			console.log("A/B Markers available");

			// SET A/B MARKER LABELS
			if(new_marker_a_label)
			{
				console.log("MARKER A: " + new_marker_a_label);
				directionsDisplay.b.b[0]._label = new_marker_a_label;
			}

			if(new_marker_b_label)
			{
				console.log("MARKER B: " + new_marker_b_label);
				directionsDisplay.b.b[1]._label = new_marker_b_label;
			}

			// UPDATE ICONS
			directionsDisplay.b.b[0].setIcon(f_url+'assets/icons/marker-a-dark.png');

			for(var i = 1; i < directionsDisplay.b.b.length-1; i++)
			{
				console.log('Remove Waypoint Marker...');
				directionsDisplay.b.b[i].setMap(null);
			}

			directionsDisplay.b.b[directionsDisplay.b.b.length-1].setIcon(f_url+'assets/icons/marker-b-dark.png');
			console.log(directionsDisplay.b.b.length-1);

			// ADD LISTENERS AND CUSTOMINFO
			resetNewMarkers();
			resetABMarkers();
			setupABMarkers();

			// INIT OVERRIDES
			gradient.initOverridesForCurrentRoute();

			setRouteTitle();			

			// DRAW TO CANVAS
			if(ex_route)
			{
				gradient.drawElevationForPoints(elevation_points,ex_route.overrides);
				ex_route = null;
			}
			else
			{
				gradient.drawElevationForPoints(elevation_points,gradient.OVERRIDES);
			}

			// CLEAR TIMER
			clearInterval(timer);
		}
		else if(dt > dmax)
		{
			// A/B MARKERS TIMEOUT
			console.error("A/B marker timeout");
			console.log(directionsDisplay);
			clearInterval(timer);
		}
		else
		{
			// WAIT FOR NEXT TICK
			dt += di;
		}
	}, di);

}


// #################
// ROUTE FUNCTIONS #

// >>> NEW ROUTE
function newRoute()
{
	// HIDE ROUTE / RESET DISTANCE MARKERS / RESET LANDMARKS
	hideRoute();
	resetDistanceMarkers();
	resetLandmarks();
	resetNewMarkers();

	// >>> CREATE TEMP 'A' MARKER
	new_marker_a = new google.maps.Marker(
        {
		position: map.getCenter(),
		draggable: true,
		crossOnDrag: false,
		icon: f_url+'assets/icons/marker-a-dark-o.png',
		map: map
        });

	// >>> ADD MOUSEMOVE LISTENER TO MAP > 'A' MARKER FOLLOWS MOUSE
	new_marker_a_move = google.maps.event.addListener(map, 'mousemove', function(e)
	{
		google.maps.event.trigger(new_marker_a,'drag');
		new_marker_a.setPosition(e.latLng);
	});

	// >>> ADD CLICK LISTENER TO MAP > SET DOWN 'A' MARKER
	new_marker_a_click = google.maps.event.addListenerOnce(map, 'click', function(e)
	{
		google.maps.event.removeListener(new_marker_a_move);
		new_marker_a.setPosition(e.latLng);

		// >>> CREATE TEMP 'A' MARKER
		new_marker_b = new google.maps.Marker(
        	{
			position: e.latLng,
			draggable: true,
			crossOnDrag: true,
			icon: f_url+'assets/icons/marker-b-dark-o.png',
			map: map
        	});

		// >>> ADD MOUSEMOVE LISTENER TO MAP > 'B' MARKER FOLLOWS MOUSE
		new_marker_b_move = google.maps.event.addListener(map, 'mousemove', function(e)
		{
			google.maps.event.trigger(new_marker_b,'drag');
			new_marker_b.setPosition(e.latLng);
		});

		// >>> ADD MOUSEMOVE LISTENER TO MAP > SET DOWN 'B' MARKER
		new_marker_b_click = google.maps.event.addListenerOnce(map, 'click', function(e)
		{
			google.maps.event.removeListener(new_marker_b_move);
			new_marker_b.setPosition(e.latLng);

        		updateRoute(new_marker_a.position,new_marker_b.position);
        		setDirectionsForRoute(route);
        		showRoute();

			// >>> ADD TILES LOADED LISTENER TO MAP > 
			google.maps.event.addListenerOnce(map, 'tilesloaded', function(e)
			{
				window.setTimeout(function()
				{
        				setupABMarkers();
        				google.maps.event.removeListener(new_route_listener);
        			},1000);
        		});

		});

	});

	// >>> ADD DRAG LISTENER TO 'A' MARKER >
	/*
	google.maps.event.addListener(new_marker_a, 'drag', function(e)
	{
		if(directionsDisplay.getMap())
		{
			google.maps.event.addListenerOnce(directionsDisplay.b.b[0],'drag',function(e)
			{
				//console.log("Drag A Marker!");
			});
			directionsDisplay.b.b[0].setPosition(e.latLng);

			directionsResponse.routes[0].legs[0].start_location = e.latLng;
			directionsDisplay.setDirections(directionsResponse);
		}
	});*/

}

// >>> HIDE CURRENT ROUTE
function hideRoute()
{
	directionsDisplayOp = {
		map: null
	};

	directionsDisplay.setOptions(directionsDisplayOp);
}

// >>> SHOW CURRENT ROUTE
function showRoute()
{
	directionsDisplayOp = {
		map: map
	};

	directionsDisplay.setOptions(directionsDisplayOp);
}

// >>> RESET DISTANCE MARKERS
function resetDistanceMarkers()
{
	for(var i = 0; i < distance_markers.length; i++)
	{
		distance_markers[i].setMap(null);
	}

	distance_markers = [];
}

// >>> RESET LANDMARKS
function resetLandmarks()
{
	for(var i = 0; i < landmarks.length; i++)
	{
		landmarks[i].setMap(null);
	}

	landmarks = [];
}

// >>> SETUP A/B MARKERS
function setupABMarkers()
{
	for(var i = 0; i < 2; i++)
	{
		var marker = directionsDisplay.b.b[i];

		// SET DISTANCE
    		marker._distance = i * polyline_route[polyline_route.length-1][1];

    		// ADD TO LANDMARKS ARRAY
		abmarkers[i] = marker;

		// SET CLICK LISTENER
		google.maps.event.addDomListener(directionsDisplay.b.b[i],'click',function(e)
		{
			marker_info.close();
			current_marker = this;
			updateMarkerInfo(this,'info');
			marker_info.open(map,this);
		});
	}
}

// >>> RESET A/B MARKERS
function resetABMarkers()
{
	directionsDisplay.b.b[0]._label = "";
	directionsDisplay.b.b[0]._distance = 0;

	directionsDisplay.b.b[1]._label = "";
	directionsDisplay.b.b[1]._distance = 0;
}

// >>> RESET NEW MARKERS
function resetNewMarkers()
{
	console.log("Reset Markers...");
	if(new_marker_a)
	{
		console.log("Remove marker A from map");
		new_marker_a.setMap(null);
		new_marker_a_label = "";
	}

	console.log(new_marker_a_move);
	if(typeof new_marker_a_move !== 'undefined')
	{ 
		if(new_marker_a_move.b !== null)
		{
			google.maps.event.removeListener(new_marker_a_move);
		}
	}

	if(typeof new_marker_a_click !== 'undefined'){ google.maps.event.removeListener(new_marker_a_click); }

	if(new_marker_b)
	{
		new_marker_b.setMap(null);
		new_marker_b_label = "";
	}

	if(new_marker_b_move){ google.maps.event.removeListener(new_marker_b_move); }
	if(new_marker_b_click){ google.maps.event.removeListener(new_marker_b_click); }

}

// >>> UPDATE ROUTE
function updateRoute(apos,bpos)
{
	route = {
		origin: apos,
		destination: bpos,
		provideRouteAlternatives: false,
		travelMode: google.maps.TravelMode.BICYCLING,
		unitSystem: google.maps.UnitSystem.METRIC
	};
}

// ####################
// LANDMARK FUNCTIONS #

// >>> ADD LANDAMRK
function addLandmark(path)
{
	// >> Check route exists.
	if(path)
	{
		// TEST > Create a test draggable map marker
		var landmark = new google.maps.Marker({
			map: map,
			draggable:true,
			position: path[path.length-1][0],
			icon: f_url+'assets/icons/marker-landmark.png'
		});

		google.maps.event.addDomListener(landmark,'click',function(e)
		{
			marker_info.close();
			current_marker = this;
			updateMarkerInfo(this,'info');
			marker_info.open(map,this);
		});
	
		google.maps.event.addDomListener(landmark,'drag',function(e)
		{
			var point = getSnapPointOnRoute(this,e.latLng);
    			landmark.setPosition(point[0]);
    			landmark._distance = point[1];
		});
	
		google.maps.event.addDomListener(landmark,'dragend',function(e)
		{
			var point = getSnapPointOnRoute(this,e.latLng);
    			landmark.setPosition(point[0]);
    			landmark._distance = point[1];
			markerUpdate();
		});
	
		landmarks.push(landmark);
	}
}

// >>> SNAP LANDMARK TO ROUTE
function getSnapPointOnRoute(landmark,cur_point)
{
	// FIND CLOSEST POINT ALONG POLYLINE
	var closest_point = polyline_route[0][0];
	var closest_dist = google.maps.geometry.spherical.computeDistanceBetween(cur_point,polyline_route[0][0]);;
	for(var i = 1; i < polyline_route.length; i++)
	{
		var d = google.maps.geometry.spherical.computeDistanceBetween(cur_point,polyline_route[i][0]);
		if(d < closest_dist)
		{
			closest_point = i;
			closest_dist = d;
		}
	}

	//console.log("LANDMARK CP: " + polyline_route[closest_point][0] + " CD: " + closest_dist + " TD: " + polyline_route[closest_point][1]);

	return polyline_route[closest_point];
}

// >>> UPDATE MARKER INFO WINDOW
function updateMarkerInfo(marker,type)
{
	var label; var content; var dist;

	if(marker._label)
	{
		label = marker._label;
		dist = marker._distance;
	}
	else
	{
		label = "";
		type = 'edit';
	}

	if(type === 'info')
	{
		content =	"<div id='marker-info'>" +
							"<p style='display: inline'>" + label + " (" + dist + ")</p>" + 
							"<span id='edit' style='cursor: pointer'>?</span>" + 
						"</div>";
	}
	else if(type === 'edit')
	{
		content =	"<div id='marker-info-edit'>" +
							"<input type='text' id='title' value='" + label + "'></input>" +
							"<span id='update' style='cursor: pointer'>+</span>" +
						"</div>";
	}
			
	marker_info.setContent(content);

}


// ######################
// ADDITIONAL FUNCTIONS #

// >>> TOGGLE VISIBILITY OF DISTANCE MARKERS
function toggleDistanceMarkers(new_visibility)
{
	for(var i = 0; i < distance_markers.length; i++)
	{
		distance_markers[i].setVisible(new_visibility);
	}
}