/**
 * @description 3day Angular Application
 *
 * @author Ian Kelly
 */

'use strict';


var huwa = angular.module('3day',
	[
		'ui.bootstrap',
		'angularBasicAuth',
		'ui.router'
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



/**
 * The states of the application
 */
huwa.config(
	[
		'$stateProvider',
		'$urlRouterProvider',
		'$logProvider',
		function ($stateProvider, $urlRouterProvider, $logProvider) {

			$logProvider.debugEnabled(true);

			// For any unmatched url, redirect to /
			$urlRouterProvider.otherwise('/login');

			// Now set up the states
			$stateProvider
				.state('login', {
					url: '/login',
					templateUrl: '/partials/login'
				})
				.state('about', {
					utl: '/about',
					templateUrl: '/partials/about'
				});
		}
	]);
