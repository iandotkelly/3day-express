/**
 * Definition of a timeline service
 */
'use strict';

var threeday = angular.module('3day');

threeday.service('timeline',
	['$log', '$interval', '$http', 'Report',
		function($log, $interval, Report) {

		//api/timeline/from/:timefrom/to/:timeto

		var reports = [];

		// populate the reports

		var service = {

			nextPage: function() {

			},

			findNew: function() {

			}
		};

		// regularly update our timeline
		$interval(service.findNew, 60000);

		return service;

}]);
