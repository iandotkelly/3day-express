/**
 * @description 3day Angular Application
 *
 * @author Ian Kelly
 */

'use strict';


var threeday = angular.module('3day',
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
threeday.controller('MainCtrl',
	[
		'$scope',
		'$log',
		'authService',
		function ($scope, $log, authService) {
			// add the 3day secret header
			authService.headers['3day-app'] = 'web app';
		}
	]);

/**
 * The states of the application
 */
threeday.config(
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
