

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
		function ($scope, $log, authService) {
			$log.log('login controller');
			$log.log($scope);

			$scope.login = function() {
				$log.log('Attempt to login');
				authService.login($scope.username, $scope.password);
			};
		}
	]);
