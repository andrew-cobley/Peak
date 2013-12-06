/*!
 * PEAK-PROTOTYPE JS Methods
 * Copyright 2013, Andrew Cobley
 */

var GLOBAL = {};

// NO ADDITIONAL PATH (REMOVE IF DECLARED ELSEWHERE)
var f_url = '';

var peakapp;
var peakapp_element;


$(document).ready(function()
{
	$('html').css('height', window.innerHeight);

	peakapp = new Peak();
	peakapp_element = $('div#container');

	console.log(peakapp_element);

	checkWidthForApp();

	$(window).resize(function()
	{
		checkWidthForApp();
	});
});

function checkWidthForApp()
{
	var width = $(window).width();

	console.log(width);

	if(width >= 640)
	{
		if(!peakapp.loaded)
		{	
			peakapp.init(peakapp_element);
		}
	}
}

$(window).resize(function() 
{
	$('html').css('height', window.innerHeight);
});