/*!
 * PEAK-PROTOTYPE
 * CORE EXAMPLE ROUTES JS Methods
 * Copyright 2013, Andrew Cobley
 */

var ex_routes = [];

ex_routes.push({
	title: 'Tongwynlais - Black Cock Inn',
	origin: {
		lat: 51.532218,
		lng: -3.251599,
		label: 'Lewis Arms'
	},
	desination: {
		lat: 51.555582,
		lng: -3.236514,
		label: 'Black Cock Inn'
	},
	waypoints: [],
	center: {
		lat: 51.541,
		lng: -3.246,
		label: ''
	},
	zoom: 12,
	overrides: {}
});

ex_routes.push({
	title: 'Rhiwbina - Caerphilly Mountain',
	origin: {
		lat: 51.530987,
		lng: -3.224412,
		label: 'Rhiwbina Hill'
	},
	desination: {
		lat: 51.559797,
		lng: -3.219455,
		label: 'Caerphilly Mountain'
	},
	waypoints: [
		{
			lat: 51.555575,
			lng: -3.236568,
			label: ''
		},
		{
			lat: 51.558977,
			lng: -3.219466,
			label: ''
		}
	],
	center: {
		lat: 51.541,
		lng: -3.246,
		label: ''
	},
	zoom: 12,
	overrides: {
		X_INTERVAL: 200,
		X_GAP: 30,
		Y_INTERVAL: 20,
		Y_GAP: 25
	}
});

ex_routes.push({
	title: "Alpe D'Huez",
	origin: {
		lat: 45.059517,
		lng: 6.037717,
		label: ''
	},
	desination: {
		lat: 45.095837,
		lng: 6.070300,
		label: ''
	},
	waypoints: [
		{
			lat: 45.071945,
			lng: 6.039133,
			label: ''
		},
		{
			lat: 45.070990,
			lng: 6.044347,
			label: ''
		},
		{
			lat: 45.083597,
			lng: 6.062372,
			label: ''
		},
		{
			lat: 45.088248,
			lng: 6.055956,
			label: ''
		},
		{
			lat: 45.091520,
			lng: 6.055484,
			label: ''
		},
		{
			lat: 45.090475,
			lng: 6.065311,
			label: ''
		},
		{
			lat: 45.091831,
			lng: 6.063048,
			label: ''
		},
		{
			lat: 45.092580,
			lng: 6.071985,
			label: ''
		}
	],
	center: {
		lat: 45.090005,
		lng: 6.124878,
		label: ''
	},
	zoom: 12,
	overrides: {
		X_GAP: 33
	}
});

ex_routes.push({
	title: "Box Hill",
	origin: {
		lat: 51.257873,
		lng: -0.322809,
		label: ''
	},
	desination: {
		lat: 51.249560,
		lng: -0.292640,
		label: ''
	},
	waypoints: [
		{
			lat: 51.250688,
			lng: -0.309935,
			label: ''
		}
	],
	center: {
		lat: 51.259014,
		lng: -0.294399,
		label: ''
	},
	zoom: 12,
	overrides: {
		X_INTERVAL: 200,
		X_GAP: 30,
		Y_GAP: 28
	}
});

