

'use strict';

var threeday = angular.module('3day');

/**
* The login controller
*
* Responsible for the overall applicaton
*/
threeday.controller('LoginCtrl',
	[
		'$scope',
		'$log',
		'authService',
		'$state',
		function ($scope, $log, authService, $state) {
			$log.log('login controller');
			$log.log($scope);

			$scope.error = false;

			$scope.login = function() {

				authService
					.login($scope.username, $scope.password)
					.success(function() {
						$state.go('timeline');
					})
					.error(function() {
						$scope.error = true;
					});
			};
		}
	]);
