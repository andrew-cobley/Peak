/*!
 * PEAK-PROTOTYPE
 * CANVAS GRADIENT JS Methods
 * Copyright 2013, Andrew Cobley
 */

function Gradient()
{
	var x_axis_interval; var x_axis_gap; var x_axis_start; var x_axis_finish;
	var y_axis_interval; var y_axis_gap; var y_axis_start; var y_axis_finish;

	var x_max; var y_max; var x_min; var y_min;

	var gradients; var sX; var sY; var offsetX; var offsetY;

	// INIT ANGLES
	var angle1 = 10;
	var angle2 = -26.6;

	// INIT THICKNESS OF GRADIENT CHART
	var width = 20;

	var canvas_min_width = 440; var canvas_min_height = 358;

	// INIT OVERRIDES
	this.OVERRIDES = {
		X_INTERVAL: null,
		X_GAP: null,
		X_START: null,
		X_FINISH: null,
		Y_INTERVAL: null,
		Y_GAP: null,
		Y_START: null,
		Y_FINISH: null,
	};
	
	// SETUP TMP CANVAS
    var tmp_cnvs = document.createElement('canvas');
    var tmp_context = tmp_cnvs.getContext('2d');

	// INIT COLOUR PALETTES
	var std_colours = {
		main: 'rgba(66,59,42,0.4)',
		bottom: {
			front: 'rgba(30,30,20,0.9)',
			side: 'rgba(30,30,20,0.85)'
		},
		gradients: {
			flat: 'rgba(75,70,54,1.0)',
			gentle: 'rgba(135,125,54,1.0)',
			medium: 'rgba(195,180,54,1.0)',
			steep: 'rgba(255,234,54,1.0)'
		},
		scalelines: {
			x: 'rgba(66,59,42,0.4)',
			y: 'rgba(66,59,42,0.4)'
		},
		text: {
			main: 'rgba(240,240,240,1.0)',
			alt: 'rgba(240,240,240,1.0)'
		}
	};
	
	var light_on_dark_colours = {
		main: 'rgba(75,70,54,0.9)',
		bottom: {
			front: 'rgba(30,30,20,1)',
			side: 'rgba(30,30,20,0.95)'
		},
		gradients: {
			flat: 'rgba(75,70,54,1.0)',
			gentle: 'rgba(135,125,54,1.0)',
			medium: 'rgba(195,180,54,1.0)',
			steep: 'rgba(255,234,54,1.0)'
		},
		scalelines: {
			x: 'rgba(66,59,42,0.4)',
			y: 'rgba(66,59,42,0.4)'
		},
		text: {
			main: 'rgba(240,240,240,1.0)',
			alt: 'rgba(240,240,240,1.0)'
		}
	};

	var dark_on_light_colours = {
		main: 'rgba(75,70,54,0.9)',
		bottom: {
			front: 'rgba(30,30,20,1)',
			side: 'rgba(30,30,20,0.95)'
		},
		gradients: {
			flat: 'rgba(75,70,54,1.0)',
			gentle: 'rgba(135,125,54,1.0)',
			medium: 'rgba(195,180,54,1.0)',
			steep: 'rgba(255,234,54,1.0)'
		},
		scalelines: {
			x: 'rgba(30,30,20,0.15)',
			y: 'rgba(30,30,20,0.15)'
		},
		text: {
			main: 'rgba(30,30,20,0.9)',
			alt: 'rgba(240,240,240,1.0)'
		}
	};
	

	this.drawElevationForPoints = function(points,overrides)
	{
		// SET INITIAL X VALUES > CHECK FOR OVERRIDES
		console.log(overrides);
		
		// >>> X START
		if(overrides.X_START)
		{
			console.log("OVERRIDE X-START");
			x_axis_start = overrides.X_START;
		}
		else
		{
			console.log("NO OVERRIDE X-START");
			x_axis_start = 0;
		}

		// >>> X FINISH
		if(overrides.X_FINISH)
		{
			console.log("OVERRIDE X-FINISH");
			x_axis_finish = overrides.X_FINISH;
		}
		else
		{
			console.log("NO OVERRIDE X-FINISH");
			x_axis_finish = points[points.length-1][0];
		}

		// >>> X INTERVAL
		if(overrides.X_INTERVAL)
		{
			console.log("OVERRIDE X-INTERVAL");
			x_axis_interval = overrides.X_INTERVAL;
		}
		else
		{
			console.log("NO OVERRIDE X-INTERVAL");
			if( (points[points.length-1][0] / 200) < 20 )
			{
				x_axis_interval = 200;
			}
			else
			{
				x_axis_interval = 1000;
			}

		}

		// >>> SNAP X AXIS START POINT TO INTERVAL BEFORE
		x_axis_start = Math.floor(x_axis_start / x_axis_interval) * x_axis_interval;


		// >>> REPOPULATE POINTS FOR X BOUNDS
		console.log(points);
		var new_points = [];
		for(var i = 0; i < points.length; i++)
		{
			if(points[i][0] >= x_axis_start && points[i][0] <= x_axis_finish && ( ((points[i][0] % x_axis_interval) === 0) || (i === points.length - 1)) )
			{
				console.log(points[i]);
				new_points.push(points[i]);
			}
		}
		points = new_points;
		console.log(points);


		// >>> GET MAX AND MIN Y (WITH X) 
		x_max = points[0][0];
		y_max = points[0][1];
		x_min = points[0][1];
		y_min = points[0][1];

		for(var i = 1; i < points.length; i++)
		{
			if(points[i][1] > y_max)
			{
				x_max = points[i][0];
				y_max = points[i][1];
			}
			else if(points[i][1] < y_min)
			{
				x_min = points[i][0];
				y_min = points[i][1];
			}
		}

		// SET INITIAL Y VALUES > CHECK FOR OVERRIDES
		// >>> Y START
		if(overrides.Y_START)
		{
			console.log("OVERRIDE Y-START");
			y_axis_start = overrides.Y_START;
		}
		else
		{
			console.log("NO OVERRIDE Y-START");
			y_axis_start = Math.round(y_min * 100) / 100;
		}

		// >>> Y FINISH
		if(overrides.Y_FINISH)
		{
			console.log("OVERRIDE Y-FINISH");
			y_axis_finish = overrides.Y_FINISH;
		}
		else
		{
			console.log("NO OVERRIDE Y-FINISH");
			y_axis_finish = Math.round(y_max * 100) / 100;
		}

		// >>> Y INTERVAL
		if(overrides.Y_INTERVAL)
		{
			console.log("OVERRIDE Y-INTERVAL");
			y_axis_interval = overrides.Y_INTERVAL;
		}
		else
		{
			console.log("NO OVERRIDE Y-INTERVAL");
			if( ((y_axis_finish - y_axis_start) / 20) <= 10 && x_axis_interval <= 500)
			{
				y_axis_interval = 20;
			}
			else if( ((y_axis_finish - y_axis_start) / 20) <= 30 )
			{
				y_axis_interval = 50;
			}
			else
			{
				y_axis_interval = 100;
			}
		}

		// SNAP Y AXIS START POINT TO INTERVAL BELOW
		y_axis_start = Math.floor(y_axis_start / y_axis_interval) * y_axis_interval;


		// SET INITIAL GAP VALUES > CHECK FOR OVERRIDES
		// >>> X GAP
		if(overrides.X_GAP)
		{
			console.log("OVERRIDE X-GAP");
			x_axis_gap = overrides.X_GAP;
		}
		else
		{
			console.log("NO OVERRIDE X-GAP");
			if(x_axis_interval <= 500)
			{
				x_axis_gap = 30;
			}
			else
			{
				x_axis_gap = 75;
			}
		}

		// >>> Y GAP
		if(overrides.Y_GAP)
		{
			console.log("NO OVERRIDE Y-GAP");
			y_axis_gap = overrides.Y_GAP;
		}
		else
		{
			console.log("NO OVERRIDE Y-GAP");
			y_axis_gap = 30;
		}

		// REFRESH OVERRIDES
		this.refreshOverrides();


		// CALCULATE AVERAGE GRADIENTS BETWEEN INTERVALS
		gradients = [];
		for(var i = 0; i < points.length-1; i++)
		{
			var gradient = 100 * ((points[i+1][1] - points[i][1]) / (points[i+1][0] - points[i][0]));
			gradients.push(gradient);
		}


		// CALCULATE MULTIPLIERS POINTS TO PIXELS
		sX = x_axis_gap / x_axis_interval; 
		sY = y_axis_gap / y_axis_interval;


		// ADJUST CANVAS WIDTH/HEIGHT AND SET OFFSET
		var w = (x_axis_gap * ( (points[points.length-1][0] - points[0][0]) / x_axis_interval)) + 100;
		var h = ( Math.sin(angle1 * Math.PI / 180) * (x_axis_gap * ((points[points.length-1][0] - points[0][0]) / x_axis_interval)) ) + ((y_axis_finish - y_axis_start) * sY) + 120;
 
		offsetX = 40; offsetY = 40;

		if(w > canvas_min_width)
		{
			cnvs.width = w;
		}

		if(h > canvas_min_height)
		{
			cnvs.height = h;
		}

		
		// SETUP FOR DRAWING
		this.updateElevation(points);

	}

    this.updateElevation = function(points)
    {
        // DRAW TO TMP CANVAS
		this.drawElevation(points, std_colours);
		
		// REFRESH CANVAS
		refreshCanvas(context);
		
		// DRAW TMP CANVAS TO CANVAS
		context.drawImage(tmp_cnvs,0,0);
		
		// TRIGGER FINISH
		canvasReady(points);
    }

	this.drawElevation = function(points, colours)
	{

		// CALCULATE SCREEN POSITIONS
		var points_pos = [];

		for(var i = 0; i < points.length; i++)
		{
			var pX = (points[i][0] - x_axis_start) * sX;
			var pY = (points[i][1] - y_axis_start) * sY;
			points_pos.push([pX,pY]);
		}

		console.log(points_pos);

		var dX = 0; dY = 0;
		var sections = [];

		console.log(offsetY + dY);

		for(var i = 0; i < points_pos.length-1; i++)
		{
			var p1 = [offsetX + dX, offsetY + dY];

			var dV = (points_pos[i+1][0] - points_pos[i][0]);
			dX += Math.cos(angle1 * Math.PI / 180) * dV;
			dY += Math.sin(angle1 * Math.PI / 180) * dV;

			var p2 = [offsetX + dX, offsetY + dY];

			var p3 = [p1[0], p1[1] + points_pos[i][1]];
			var p4 = [p2[0], p2[1] + points_pos[i+1][1]];

			var dX2 = Math.cos(angle2 * Math.PI / 180) * -width;
			var dY2 = Math.sin(angle2 * Math.PI / 180) * -width;

			var p5 = [p3[0] + dX2, p3[1] + dY2];
			var p6 = [p4[0] + dX2, p4[1] + dY2];

			var section = [p1,p2,p3,p4,p5,p6];

			sections.push(section);
		}

		console.log(sections);

		// >>> SECTION - FRONT FULL
		var section_front_full = [];

		section_front_full.push(sections[0][0]);
		section_front_full.push([sections[0][0][0] + (Math.cos(angle2 * Math.PI / 180) * -width), sections[0][0][1] + (Math.sin(angle2 * Math.PI / 180) * -width)]);
		section_front_full.push([sections[0][2][0] + (Math.cos(angle2 * Math.PI / 180) * -width), sections[0][2][1] + (Math.sin(angle2 * Math.PI / 180) * -width)]);
		section_front_full.push(sections[0][2]);
	

		// >>> SECTION - SIDE FULL
		var section_side_full = [];

		section_side_full.push(sections[0][0]);
		section_side_full.push(sections[0][2]);

		for(var i = 0; i < sections.length; i++)
		{
			section_side_full.push(sections[i][3]);
		}

		section_side_full.push(sections[sections.length-1][1]);


		// >>> SECTION - FRONT BOTTOM
		var bY = 15;
		var section_front_bottom = [];	

		section_front_bottom.push([section_front_full[1][0],section_front_full[1][1]+1]);
		section_front_bottom.push([sections[0][0][0],sections[0][0][1]+1]);
		section_front_bottom.push([section_front_bottom[1][0], section_front_bottom[1][1] - bY-2]);
		section_front_bottom.push([section_front_bottom[0][0], section_front_bottom[0][1] - bY-2]);


		// >>> SECTION - SIDE BOTTOM
		var section_side_bottom = [];

		section_side_bottom.push([sections[0][0][0], sections[0][0][1]+1]);
		section_side_bottom.push([sections[sections.length-1][1][0],sections[sections.length-1][1][1]+1]);
		section_side_bottom.push([section_side_bottom[1][0], section_side_bottom[1][1] - bY-2]);
		section_side_bottom.push([section_side_bottom[0][0], section_side_bottom[0][1] - bY-2]);

	
		// CALCULATE - SCALES
		// >>> X
		var xscales = [];

		for(var i = 0; i < points.length-1; i++)
		{
			if( (points[i][0] % x_axis_interval) === 0 && points[i][0] !== 0)
			{
				xscales.push({
					label: points[i][0] / 1000,
					start_point: sections[i][0],
					end_point: sections[i][2]
				});
			}	
		}

		console.log(xscales);
	

		// >>> Y
		var yscales = [];
		
		console.log("YS?: " + y_axis_start);

		var y_int = 0;
		while(y_int <= y_max)
		{
			if(y_int >= y_axis_start)
			{
				console.log("Yax: " + y_int);
		
				var aX = section_side_full[0][0];
				var aY = section_side_full[0][1] + ((y_int - y_axis_start) * sY);

				var bX = section_side_full[section_side_full.length-1][0];
				var bY = section_side_full[section_side_full.length-1][1] + ((y_int - y_axis_start) * sY);

				yscales.push({
					label: y_int,
					start_point: [aX,aY],
					end_point: [bX,bY]
				});
			}
		
			y_int += y_axis_interval;
		}



		// ######
		// DRAW #
		// ######
		
        // REFRESH TMP CONTEXT
	tmp_cnvs.width = cnvs.width;
	tmp_cnvs.height = cnvs.height;
        refreshCanvas(tmp_context);

		// DRAW SECTIONS

		tmp_context.lineWidth = 2;
		tmp_context.strokeStyle = "#FF0000";
		tmp_context.fillStyle = "CCCC00";


		for(var i = sections.length-1; i >= 0; i--)
		{
			tmp_context.fillStyle = getGradientColourForSection(i,colours);
			drawPolygon([sections[i][2],sections[i][3],sections[i][5],sections[i][4]]);
			tmp_context.fill();
		}
	
		tmp_context.fillStyle = colours.gradients.steep;
		drawPolygon(section_front_full);
		tmp_context.fill();
	
		tmp_context.fillStyle = colours.bottom.side;
		drawPolygon(section_side_bottom);
		tmp_context.fill();

		tmp_context.fillStyle = colours.bottom.front;
		drawPolygon(section_front_bottom);
		tmp_context.fill();


		// DRAW SIDE

		tmp_context.save();

		tmp_context.fillStyle = colours.main;
		drawPolygon(section_side_full);
		tmp_context.fill();
		tmp_context.clip();

		// >>> DRAW SIDE SCALES

		tmp_context.lineWidth = 0.6;
		tmp_context.strokeStyle = colours.scalelines.x;

		for(var i = 0; i < xscales.length; i++)
		{
			drawLine([xscales[i].start_point, xscales[i].end_point]);
		}

		tmp_context.lineWidth = 0.5;
		tmp_context.strokeStyle = colours.scalelines.y;

		for(var i = 0; i < yscales.length; i++)
		{
			drawLine([yscales[i].start_point, yscales[i].end_point]);
		}

		tmp_context.restore();


		// DRAW STATS
		// >>> DRAW GRADIENTS
		tmp_context.save();
    		tmp_context.font = '12px "Open Sans Condensed", sans-serif';
    		tmp_context.textAlign = 'center';
    		tmp_context.fillStyle = colours.text.alt;

		for(var i = 0; i < gradients.length; i++)
		{
			if(gradients[i] >= 5)
			{
				var x = sections[i][0][0] + ((sections[i][1][0] - sections[i][0][0]) / 2);
				var y = sections[i][0][1] + ((sections[i][1][1] - sections[i][0][1]) / 2);
		
				tmp_context.setTransform (1, ((-angle1) * Math.PI / 180), 0, 1, x, -y-5);
				drawText((Math.round(gradients[i]*10)/10)  + '%', 0, 0) ;
			}
		}	

		tmp_context.setTransform (1, 0, 0, 1, 0, 0);
		tmp_context.restore();
	
		// >>> DRAW KM MARKERS
		tmp_context.save();
      		tmp_context.font = '12px "Open Sans Condensed", sans-serif';
      		tmp_context.textAlign = 'right';
      		tmp_context.fillStyle = colours.text.alt;

		for(var i = 0; i < xscales.length; i++)
		{
			if( (xscales[i].label % 1) === 0 )
			{
				var x = xscales[i].start_point[0] + 2;
				var y = xscales[i].start_point[1] - 15;

				tmp_context.setTransform (1, ((-angle1) * Math.PI / 180), 0, 1, x, -y-5);
				drawText(xscales[i].label, 0, 0);
			}
		}


		tmp_context.setTransform (1, 0, 0, 1, 0, 0);
		tmp_context.restore();

		// >>> DRAW HEIGHT MARKERS
		tmp_context.save();
		tmp_context.font = '11px "Open Sans Condensed", sans-serif';
		tmp_context.textAlign = 'center';
		tmp_context.fillStyle = colours.text.main;

		for(var i = 0; i < yscales.length; i++)
		{
			var x = yscales[i].end_point[0] + 12;
			var y = yscales[i].end_point[1] - 3;
		
			drawText(yscales[i].label + "m", x, y);
		}	

		tmp_context.restore();

		// >>> DRAW TOTAL KM
		tmp_context.save();

		var x = section_side_bottom[2][0];
		var y = section_side_bottom[2][1];

		tmp_context.lineWidth = 0.8;
		tmp_context.strokeStyle = "rgba(20,20,20,0.9)";
		drawLine([ [x,y-3],[x,y-23] ]);

		tmp_context.font = '16px "Open Sans Condensed", sans-serif';
		tmp_context.textAlign = 'center';
		tmp_context.fillStyle = colours.text.main;

		var km = points[points.length-1][0] / 1000;

		drawText(Math.round(km*100)/100 + "km", x, y-43) ;
		tmp_context.restore();


		// DRAW MARKERS
		// >>> PEAK MARKER
		var x = offsetX + getXForDist(x_max - x_axis_start,sX,angle1);
		var y = getPeakForX(sections,x)
		
		x = shiftX(x,-width/2,angle2);
		y = shiftY(y,-width/2,angle2);

		tmp_context.lineWidth = 0.8;
		tmp_context.strokeStyle = "rgba(20,20,20,0.9)";
		drawLine([ [x,y],[x,y+20] ]);

		tmp_context.font = '16px "Open Sans Condensed", sans-serif';
		tmp_context.textAlign = 'center';
		tmp_context.fillStyle = colours.text.main;
		drawText(Math.round(y_max) + "m", x, y+25);

		// >>> A/B MARKERS
    	if(abmarkers)
    		{
    			for(var i = 0; i < abmarkers.length; i++)
			{
				if(abmarkers[i]._label !== "")
				{
					drawMarker(sections,abmarkers[i],colours);
				}	
			}
    	}

		// >>> LANDMARK MARKERS
		if(landmarks)
		{
			for(var i = 0; i < landmarks.length; i++)
			{
				if(landmarks[i]._label !== "" && landmarks[i]._label !== undefined)
				{
					drawMarker(sections,landmarks[i],colours);
				}
			}
		}

	}
	
	// ADDITIONAL FUNCTIONS
	// >>> GET Y PEAK AT POINT X
	var getPeakForX = function(sections,x)
	{
		// IF X IS INITAL POINT
		if(x <= sections[0][2][0])
		{
			return sections[0][2][1];
		}

		for(var i = 0; i < sections.length; i++)
		{
			if(x <= sections[i][3][0])
			{
				if(x === sections[i][3][0])
				{
					return sections[i][3][1];
				}

				var dVM = sections[i][3][0] - sections[i][2][0];
				var dVX = x - sections[i][2][0];

				return ( sections[i][2][1] + ((dVX / dVM) * (sections[i][3][1] - sections[i][2][1])) );
			}
		}

		return sections[sections.length-1][3][1];

	}

	// >>> GET X FOR A GIVEN DISTANCE
	var getXForDist = function(d,sX,angle)
	{
		return Math.cos(angle * Math.PI / 180) * (d * sX);
	}

	// >>> SHIFT X BY OFFSET AT ANGLE
	var shiftX = function(x,dX,angle)
	{
		return x + (Math.cos(angle * Math.PI / 180) * dX);
	}

	// >>> SHIFT Y BY OFFSET AT ANGLE
	var shiftY = function(y,dY,angle)
	{
		return y + (Math.sin(angle * Math.PI / 180) * dY);
	}

	// >>> DRAW POLYGON FOR GIVEN POINTS
	var drawPolygon = function(points)
	{
		tmp_context.beginPath();
		tmp_context.moveTo(points[0][0], cnvs.height - points[0][1]);
		for(var i = 0; i < points.length; i++)
		{
			tmp_context.lineTo(points[i][0], cnvs.height - points[i][1]);
		}
		tmp_context.closePath();
	}

	// >>> DRAW LINE BETWEEN GIVEN POINTS
	var drawLine = function(points)
	{
		tmp_context.beginPath();
		tmp_context.moveTo(points[0][0], cnvs.height - points[0][1]);
		tmp_context.lineTo(points[1][0], cnvs.height - points[1][1]);
		tmp_context.stroke();
	}

	// >>> DRAW TEXT AT GIVEN POINT
	var drawText = function(text,x,y)
	{
		tmp_context.fillText(text, x, cnvs.height - y);
	}

	// >>> DRAW MARKER
	var drawMarker = function(sections,marker,colours)
	{
		var x = offsetX + getXForDist(marker._distance,sX,angle1);
		console.log("X>> " + x);
		var y = getPeakForX(sections,x);
		x = shiftX(x,-width/2,angle2);
		y = shiftY(y,-width/2,angle2);

		tmp_context.lineWidth = 0.8;
		tmp_context.strokeStyle = "rgba(20,20,20,0.9)";
		drawLine([ [x,y],[x,y+40] ]);

		tmp_context.font = '16px "Open Sans Condensed", sans-serif';
		tmp_context.textAlign = 'center';
		tmp_context.fillStyle = colours.text.main;
		drawText(marker._label, x, y+45);
	}

	// >>> GET COLOUR FOR GRADIENT PERCENTAGE
	var getGradientColourForSection = function(i,colours)
	{
		if(gradients[i] < 2)
		{
			return colours.gradients.flat;	
		}
		else if(gradients[i] < 5)
		{
			return colours.gradients.gentle;	
		}
		else if(gradients[i] < 10)
		{
			return colours.gradients.medium;	
		}
		else if(gradients[i] >= 10)
		{
			return colours.gradients.steep;	
		}
	}

	// >>> CLEAR CANVAS
	var refreshCanvas = function(context)
	{
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, cnvs.width, cnvs.height);
		context.restore();
	}

	// >>> INIT OVERRIDES
	this.initOverridesForCurrentRoute = function()
	{

		this.OVERRIDES.X_INTERVAL = null;
		this.OVERRIDES.X_GAP = null;
		this.OVERRIDES.X_START = null;
		this.OVERRIDES.X_FINISH = null;
		this.OVERRIDES.Y_INTERVAL = null;
		this.OVERRIDES.Y_GAP = null;
		this.OVERRIDES.Y_START = null;
		this.OVERRIDES.Y_FINISH = null;
	}

	// >>> SET OVERRIDES FOR CURRENT VALUES
	this.setOverrides = function()
	{
		if($.isNumeric(OVERRIDES_SECTION.children('#x-interval').val()) && parseInt(OVERRIDES_SECTION.children('#x-interval').val()) !== x_axis_interval)
		{
			this.OVERRIDES.X_INTERVAL = parseInt(OVERRIDES_SECTION.children('#x-interval').val());
		}

		if($.isNumeric(OVERRIDES_SECTION.children('#x-gap').val()) && parseInt(OVERRIDES_SECTION.children('#x-gap').val()) !== x_axis_gap)
		{
			this.OVERRIDES.X_GAP = parseInt(OVERRIDES_SECTION.children('#x-gap').val());
		}

		if($.isNumeric(OVERRIDES_SECTION.children('#x-start').val()) && parseInt(OVERRIDES_SECTION.children('#x-start').val()) !== x_axis_start)
		{
			this.OVERRIDES.X_START = parseInt(OVERRIDES_SECTION.children('#x-start').val());
		}

		if($.isNumeric(OVERRIDES_SECTION.children('#x-finish').val()) && parseInt(OVERRIDES_SECTION.children('#x-finish').val()) !== x_axis_finish)
		{
			this.OVERRIDES.X_FINISH = parseInt(OVERRIDES_SECTION.children('#x-finish').val());
		}

		if($.isNumeric(OVERRIDES_SECTION.children('#y-interval').val()) && parseInt(OVERRIDES_SECTION.children('#y-interval').val()) !== y_axis_interval)
		{
			this.OVERRIDES.Y_INTERVAL = parseInt(OVERRIDES_SECTION.children('#y-interval').val());
		}

		if($.isNumeric(OVERRIDES_SECTION.children('#y-gap').val()) && parseInt(OVERRIDES_SECTION.children('#y-gap').val()) !== y_axis_gap)
		{
			this.OVERRIDES.Y_GAP = parseInt(OVERRIDES_SECTION.children('#y-gap').val());
		}

		if($.isNumeric(OVERRIDES_SECTION.children('#y-start').val()) && parseInt(OVERRIDES_SECTION.children('#y-start').val()) !== y_axis_start)
		{
			this.OVERRIDES.Y_START = parseInt(OVERRIDES_SECTION.children('#y-start').val());
		}

		if($.isNumeric(OVERRIDES_SECTION.children('#y-finish').val()) && OVERRIDES_SECTION.children('#y-finish').val() !== y_axis_finish)
		{
			this.OVERRIDES.Y_FINISH = OVERRIDES_SECTION.children('#y-finish').val();
		}

		console.log(this.OVERRIDES);
	}

	// >>> REFRESH DISPLAYED OVERRIDES FOR CURRENT
	this.refreshOverrides = function()
	{
		OVERRIDES_SECTION.children('#x-interval').val(x_axis_interval);
		OVERRIDES_SECTION.children('#x-gap').val(x_axis_gap);
		OVERRIDES_SECTION.children('#x-start').val(x_axis_start);
		OVERRIDES_SECTION.children('#x-finish').val(x_axis_finish);

		OVERRIDES_SECTION.children('#y-interval').val(y_axis_interval);
		OVERRIDES_SECTION.children('#y-gap').val(y_axis_gap);
		OVERRIDES_SECTION.children('#y-start').val(y_axis_start);
		OVERRIDES_SECTION.children('#y-finish').val(y_axis_finish);
	}
	
	this.setCanvasToPNGLightOnDark = function()
	{
	    	// DRAW TO TMP CANVAS
		this.drawElevation(elevation_points, light_on_dark_colours);
		
		// TMP CANVAS TO DATA
		var dataUrl = tmp_cnvs.toDataURL();
		
        	// DISPLAY IN NEW WINDOW
        	window.open(dataUrl, "toDataURL() image", "width=" + tmp_cnvs.width*1.05 + ", height=" + tmp_cnvs.height*1.05);
	}

	this.setCanvasToPNGDarkOnLight = function()
	{
	    	// DRAW TO TMP CANVAS
		this.drawElevation(elevation_points, dark_on_light_colours);
		
		// TMP CANVAS TO DATA
		var dataUrl = tmp_cnvs.toDataURL();
		
        	// DISPLAY IN NEW WINDOW
        	window.open(dataUrl, "toDataURL() image", "width=" + tmp_cnvs.width*1.05 + ", height=" + tmp_cnvs.height*1.05);
	}
	
	
}