/**
 * Definition of a Report 'class'
 */

'use strict';

var threeday = angular.module('3day');

threeday.factory('Report', ['$log', function($log) {

	function Report() {
		this.fred = 'Hello';
	}

	Report.prototype.doSomething = function(message) {
		$log.log(message);
		$log.log(this.fred);
	};

	return Report;
}]);
