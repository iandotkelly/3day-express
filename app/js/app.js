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
		'ui.router',
		'infinite-scroll'
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
		'authDefaults',
		'timeline',
		function ($scope, $log, authService, authDefaults, timeline) {

			// configure the auth service
			authDefaults.authenticateUrl = '/api/users';
			authService.headers['3day-app'] = 'web app';

			// do something with the timeline
			$log.log(timeline);
			timeline.doSomething();
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
				.state('timeline', {
					url: '/timeline',
					templateUrl: '/partials/timeline'
				})
				.state('about', {
					utl: '/about',
					templateUrl: '/partials/about'
				});
		}
	]);
