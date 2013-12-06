/*!
 * PEAK-PROTOTYPE
 * PEAK APP JS Methods
 * Copyright 2013, Andrew Cobley
 */

function Peak()
{

	this.el;
	this.loaded = false;

	this.init = function(el)
	{
		this.el = el;
		this.loaded = true;
		p = this;
		
		// LOAD GOOGLE MAPS (ASYNC)
		// > (NEEDS TO LOAD BEFORE OTHER SCRIPTS)

  		var script = document.createElement("script");
  		script.type = "text/javascript";
  		script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=p.getFiles";
  		document.body.appendChild(script);
	}

	function load()
	{
		console.log("LOADING PEAK APP...");
		
		// INIT GRADIENT CHART FUNCTIONS
		gradient = new Gradient();

		// INIT EXAMPLE ROUTE
		ex_route = ex_routes[0];

		// INIT CANVAS
		cnvs = document.getElementById('gradient-chart');

		// SET OVERRIDES SECTION CONSTANT
		OVERRIDES_SECTION = $('section#option-overrides ul li');

		// CHECK / SET CONTEXT
		if(cnvs.getContext)
		{
			console.log("CANVAS");
			context = cnvs.getContext('2d');
		}

		// SETUP USER INTERFACE
		setupUI();

		// LOAD MAP
		initialiseMap();
	}

	this.getFiles = function()
	{
		var el = this.el;

		console.log("LOADED: GOOGLE MAPS API");

		$.when(
			// ADD PEAK CSS

			$('head').append('<link rel="stylesheet" href="'+f_url+'css/peak.css" type="text/css" />'),

			// ADD PEAK HTML
			$.get(f_url+'peak.html').success(function(data)
			{
     				el.html(data);
 			}),

			// ADD PEAK JAVASCRIPT

			$.getScript(f_url+"js/core-google-maps.js", function()
			{
		   	 console.log("LOADED: js/core-google-maps.js");
			}),
			$.getScript(f_url+"js/core-canvas-gradients.js", function()
			{
		  	  console.log("LOADED: js/core-canvas-gradients.js");
			}),
			$.getScript(f_url+"js/core-example-routes.js", function()
			{
		   	 console.log("LOADED: js/core-example-routes.js");
			}),

			$.getScript(f_url+"js/jquery-ui.js", function()
			{
		   	 console.log("LOADED: js/jquery-ui.js");
			}),
			$.getScript(f_url+"js/jquery.mousewheel.min.js", function()
			{
		   	 console.log("LOADED: js/jquery.mousewheel.min.js");
			}),
			$.getScript(f_url+"js/jquery.kinetic.min.js", function()
			{
		   	 console.log("LOADED: js/jquery.kinetic.min.js");
			}),
			$.getScript(f_url+"js/jquery.sizes.js", function()
			{
		   	 console.log("LOADED: js/jquery.sizes.js");
			}),

			$.Deferred(function(deferred)
			{
				$(deferred.resolve);
			})
		).done(function()
		{
			load();
		}
		).fail(function()
		{
	    		console.error('PEAK FAILED TO INITIALISE! (COULD NOT LOAD ADDITIONAL SCRIPTS)');
		});

	}

	function setupUI()
	{
		// SETUP KINETIC FOR CANVAS MOVE
		$('section#av-gradients').kinetic();

		// SETUP JQUERY

		canvas = $('canvas#gradient-chart');
		section = canvas.parent();

		//$('section#options').hide();
		$('section#info').hide();

		// > HIDE CONTENT
		$.each($('section#options section'), function(e)
		{
			//$(this).hide();
		});

		// > ADD EXAMPLE ROUTES TO MENU
		for(var i = 0; i < ex_routes.length; i++)
		{
			$('section#option-routes ul').append(
				'<li id="' + i + '" class="pre-route" title="' + ex_routes[i].title + '"><span 	class="icon-globe"></span>' + ex_routes[i].title + '</li>'
			);
		}

		// SETUP JQUERY LISTENERS
		// > LISTEN FOR NAV OPTIONS CLICK
		$('nav#map-options ul li').unbind("click").click(function(e)
		{
			if($(this).hasClass('selected'))
			{
				// MENU ALREADY SELECTED > HIDE
				$(this).removeClass('selected');

				$('section#options').toggle('slide',
				{
           	 		direction: 'left'
    				},300);
			}
			else
			{
				// MENU NOT SELECTED
				var new_menu_item = $(this);
				var old_menu_item;

				// > CHECK IF ANY MENU IS CURRENTLY SELECTED
				$.each($('nav#map-options ul li'), function(e)
				{
					if($(this).hasClass('selected'))
					{
						old_menu_item = $(this);
					}
				});

				if(old_menu_item)
				{
					old_menu_item.removeClass('selected');
					$('section#options').hide('slide',
					{
            					direction: 'left'
    					},
    					300,
    					function(e)
    					{
    						// HIDE OLD CONTENT
    						$.each($('section#options section'), function(e)
						{
							$(this).hide();
						});

    						// SET NEW MENU ITEM AND CONTENT
    						new_menu_item.addClass('selected');
    						if( new_menu_item.attr('id') === 'map-option-overrides' )
    						{
    							gradient.refreshOverrides();
    						}
    						$('section#options section.' + new_menu_item.attr('id')).show();

    						// SLIDE SECTION BACK OUT
						$('section#options').show('slide',
						{
            						direction: 'left'
    						},300);
    					});
				}
				else
				{
					// HIDE OLD CONTENT
    					$.each($('section#options section'), function(e)
					{
						$(this).hide();
					});

    					// SET NEW MENU ITEM AND CONTENT
    					new_menu_item.addClass('selected');
    					if( new_menu_item.attr('id') === 'map-option-overrides' )
    					{
    						gradient.refreshOverrides();
    					}
    					$('section#options section.' + new_menu_item.attr('id')).show();

    					// SLIDE SECTION BACK OUT
					$('section#options').show('slide',
					{
            					direction: 'left'
    					},300);
				}
			}
		});


		// > LISTEN FOR ROUTE MENU CLICK
		$('section#option-routes ul li').unbind("click").click(function(e)
		{
			// CHECK IF NEW ROUTE ITEM SELECTED
			if($(this).attr('id') === 'new-route')
			{
				newRoute();
			}

			$('nav#map-options ul li#map-option-routes').trigger('click');
	
			if($(this).hasClass('pre-route'))
			{
				ex_route = ex_routes[parseInt($(this).attr('id'))];
				initialiseMap();
			}
	
		});

		// > LISTEN FOR LANDMARK MENU CLICK
		$('section#option-landmarks ul li').unbind("click").click(function(e)
		{
			// CHECK IF NEW ROUTE ITEM SELECTED
			if($(this).attr('id') === 'add-landmark')
			{
				console.log("Add Landmark!");
				addLandmark(polyline_route);
			}

			$('nav#map-options ul li#map-option-landmarks').trigger('click');
		});

		// > LISTEN FOR OVERRIDES MENU CLICK
		$('section#option-overrides ul li#refresh-overrides').unbind("click").click(function(e)
		{
			console.log("Refeshing overrides...");
			gradient.setOverrides();
			console.log(gradient.OVERRIDES);
			gradient.drawElevationForPoints(elevation_points,gradient.OVERRIDES);
		});


		// > LISTEN FOR GRADIENT CHART SHOW / HIDE
		$('li#map-info-gradient').unbind("click").click(function(e)
		{
			e.preventDefault();
	
			if($(this).hasClass('selected'))
			{
				$(this).removeClass('selected');
			}
			else
			{
				$(this).addClass('selected');
			}

			if($('section#info').data('status') === 'maximised')
			{
				$('section#info').data('status','hide');
				minimiseInfo();
			}
			else
			{
				$('section#info').data('status','minimised');
				toggleInfo();
			}
		});

		// > SET INITIAL STATE OF GRADIENT CHART TO MINIMISED
		$('section#info').data('status','hide');

		// > LISTEN FOR GRADIENT CHART MAX-MIN
		$('section#info ul li#gradient-max-min').unbind("click").click(function(e)
		{
			e.preventDefault();
			if($('section#info').data('status') === 'minimised')
			{
				$('section#info').data('status','maximised');
				maximiseInfo();
			}
			else
			{
				$('section#info').data('status','minimised');
				minimiseInfo();
			}
		});


		// > LISTEN FOR GRADIENT CHART ZOOM
		$('section#info ul li#gradient-zoom').unbind("click").click(function(e)
		{
			e.preventDefault();
			if($('section#info').data('zoomed') === 'in')
			{
				zoomOut();
			}
			else
			{
				zoomIn();
			}
		});

		// > LISTEN FOR GRADIENT CHART TO PNG (LIGHT ON DARK)
		$('section#info ul li#to-png-light-on-dark').unbind("click").click(function(e)
		{
			console.log("REQUESTED: PNG (LIGHT ON DARK)");
			gradient.setCanvasToPNGLightOnDark();
		});

		// > LISTEN FOR GRADIENT CHART TO PNG (DARK ON LIGHT)
		$('section#info ul li#to-png-dark-on-light').unbind("click").click(function(e)
		{
			console.log("REQUESTED: PNG (DARK ON LIGHT)");
			gradient.setCanvasToPNGDarkOnLight();
		});
	}
}


/*!
 * HELPER JS Methods
 */

function toggleInfo()
{
	$('section#info').toggle('slide',
	{
        direction: 'right'
    },400);
}

function minimiseInfo()
{
	var canvas = $('canvas#gradient-chart');
	var section = $('section#info');

	var target_width = $('#map-wrapper').width() / 2;
	var target_height = $('nav#map-info').height();
	var target_margin_top = 0;

	setMarginForScroll(canvas);
	animateCanvasToCenter(canvas,target_width,target_height);

	$('section#info').animate(
	{
		width: target_width,
		height: target_height,
		marginTop: target_margin_top
	},400,function()
	{
		console.log("ZOOM STATUS: " + $('section#info').data('zoomed'));
		if($('section#info').data('zoomed') === 'in')
		{
			zoomOut();
		}
		if($('section#info').data('status') === 'hide')
		{
			toggleInfo();
		}
	});

}

function maximiseInfo()
{
	var canvas = $('canvas#gradient-chart');
	var section = $('section#info');

	var target_width = $('#map-wrapper').width() - 40;
	var target_height = $('#map-wrapper').height() - 20;
	var target_margin_top = -(($('#map-wrapper').height() - $('nav#map-info').height() - 20)/2);

	setMarginForScroll(canvas);
	animateCanvasToCenter(canvas,target_width,target_height);

	$('section#info').animate(
	{
        	width: target_width,
		height: target_height,
		marginTop: target_margin_top
    	},400,function()
	{
		zoomIn();
	});

}

function setMarginForScroll(canvas)
{
	var section = canvas.parent();

	var sX = section.scrollLeft();
	var sY = section.scrollTop();

	if(sX > 0)
	{
		canvas.margin({left: -sX});
		section.scrollLeft(0);
	}

	if(sY > 0)
	{
		canvas.margin({top: -sY});
		section.scrollTop(0);
	}
}

function setScrollForMargin(canvas)
{
	var section = canvas.parent();

	var mX = canvas.margin().left;
	var mY = canvas.margin().top;

	console.log(mX + "," + mY);

	if(mX < 0)
	{
		canvas.margin({left: 0});
		section.scrollLeft(-mX);
	}

	if(mY < 0)
	{
		canvas.margin({top: 0});
		section.scrollTop(-mY);
	}

}

function animateCanvasToCenter(canvas,target_width,target_height)
{
	var section = canvas.parent();

	var tMX = (target_width - canvas.width()) / 2;
	var tMY = (target_height - canvas.height()) / 2;

	canvas.animate(
	{
		marginLeft: tMX,
		marginTop: tMY
	},
	400,function(e)
	{
		setScrollForMargin(canvas);
	});
}

function setCanvasToCenter()
{
	var canvas = $('canvas#gradient-chart');
	var section = $('section#info');
	var mX; var mY;

	console.log(section.width() + " - " + canvas.width());
	console.log($('section#av-gradients').width());

	if((section.width() - canvas.width()) !== 0)
	{
		mX = (section.width() - canvas.width()) / 2;
		console.log(mX + " > " + section.width() + " | " + canvas.width());
	}
	else
	{
		mX = 0;
	}
	
	if((section.height() - canvas.height()) !== 0)
	{
		mY = (section.height() - canvas.height()) / 2;
	}
	else
	{
		mY = 0;
	}

	canvas.margin({left: mX});
	canvas.margin({top: mY});

	setScrollForMargin(canvas);

}

function zoomOut()
{
	$('section#info').data('zoomed','out');

	var canvas = $('canvas#gradient-chart');

	var values = getValuesForZoomOut();	

	if(values.width && values.height)
	{
		// SET VALUES FOR CENTER ZOOM
		var tMX = ($('section#info').width() - values.width) / 2;
		var tMY = ($('section#info').height() - values.height) / 2;

		animateZoom(canvas, values.width, values.height, tMX, tMY);
		setIconZoomIn();
	}

}

function getValuesForZoomOut()
{
	var canvas = $('canvas#gradient-chart');

	console.log(cnvs.width + " ??? " + $('section#info').width());

	if( cnvs.width > $('section#info').width() || cnvs.height > $('section#info').height())
	{
		var pDX = $('section#info').width() / cnvs.width;
		var pDY = $('section#info').height() / cnvs.height;
		
		// > CHECK IF CANVAS SHOULD BE SCALED BY WIDTH OR HEIGHT
		if(pDX < pDY)
		{
			console.log("Zooming out (WIDTH BASED)...");
			return { width: cnvs.width*pDX, height: cnvs.height*pDX };
		}
		else
		{
			console.log("Zooming out (HEIGHT BASED)...");
			return { width: cnvs.width*pDY, height: cnvs.height*pDY, }
		}

	}
}

function zoomIn()
{
	$('section#info').data('zoomed','in');

	var canvas = $('canvas#gradient-chart');

	// SET VALUES FOR CENTER ZOOM
	var tMX = ($('section#info').width() - cnvs.width) / 2;
	var tMY = ($('section#info').height() - cnvs.height) / 2;

	// RESET TO ACTUAL CANVAS WIDTHS
	animateZoom(canvas, cnvs.width, cnvs.height, tMX, tMY);
	setIconZoomOut();
}

function animateZoom(canvas,w,h,tMX,tMY)
{
	canvas.animate(
	{
		width: w,
		height: h,
		marginLeft: tMX,
		marginTop: tMY
	},400,function(e)
	{
		setScrollForMargin(canvas);
	});
}

function setIconZoomIn()
{
	$('li#gradient-zoom span').removeClass('icon-zoom-out').addClass('icon-zoom-in');
}

function setIconZoomOut()
{
	$('li#gradient-zoom span').removeClass('icon-zoom-in').addClass('icon-zoom-out');
}

function canvasReady(points)
{
	elevation_points = points;

	var canvas = $('canvas#gradient-chart');

	// ZOOM TO FILL SECTION
	var values = getValuesForZoomOut();

	console.log(values.width + "," + values.height);

	if(values.width && values.height)
	{
		$('section#info').data('zoomed','out');
		canvas.width(values.width);
		canvas.height(values.height);
		setIconZoomIn();
	}

	setCanvasToCenter();

	if($('section#info').data('status') === 'hide')
	{
		$('section#info').data('status','minimised');
		toggleInfo();
	}
	
}

function markerUpdate()
{
	gradient.updateElevation(elevation_points);
	console.log("Marker Update!");
}

function setRouteTitle()
{
	console.log('>>> set route title');
	if(ex_route)
	{
		$('div#title-wrapper h2').text(ex_route.title);
	}
	else
	{
		$('div#title-wrapper h2').text('');
	}
}