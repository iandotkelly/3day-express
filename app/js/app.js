/**
 * @description 3day Angular Application
 *
 * @author Ian Kelly
 */

'use strict';


var huwa = angular.module('3day',
	[
	]);

/**
 * The main controller
 *
 * Responsible for the overall applicaton
 */
huwa.controller('MainCtrl',
	[
		'$scope',
		'$log',
		function ($scope, $log) {
			$log.log($scope);
		}
	]);
