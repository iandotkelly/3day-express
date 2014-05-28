/**
* @description Route for /api/timeline
*
* @author Ian Kelly
*/

'use strict';

var Report = require('../models/report');
var httpStatus = require('http-status');

/**
* Get reports by 3Day Timeline
*
* POST /api/timeline/from/:timefrom/to/:timeto
*/
function byTime(req, res, next) {

	var timeFrom = new Date(req.params.timeFrom);
	var timeTo = new Date(req.params.timeTo);
	var user = req.user;

	var shortList;

	if (req.body && req.body.length && req.body.length > 0) {
		shortList = req.body;
	}

	var followingIds = user.allAuthorized(shortList);

	Report.find({
		'userid': {
			$in: followingIds
		},
		'date': {
			$gte: timeFrom,
			$lte: timeTo
		}
	})
	.select('-__v -_id -updated')
	.sort('-date')
	.limit(5000)	// put a sensible big upper limit - don't want to stress things
	.exec(function (err, docs) {
		if (err) {
			return next(err);
		}

		return res.json(httpStatus.OK, docs);
	});
}

/**
* Get reports by server timeline
*
* POST /api/timeline/:time/:number
*/
function byPage(req, res, next) {

	var time = req.params.time || new Date();
	var number = req.params.number || 100;
	var user = req.user;

	var shortList;

	if (req.body && req.body.length && req.body.length > 0) {
		shortList = req.body;
	}

	user.allAuthorized(shortList, function (err, followingIds) {

		Report.find({
			'userid': {
				$in: followingIds
			},
			'created': {
				$lte: new Date(time)
			}
		})
		.select('-__v -_id -updated')
		.sort('-created')
		.limit(number)
		.exec(function (err, docs) {
			if (err) {
				return next(err);
			}

			return res.json(httpStatus.OK, docs);
		});
	});
}

module.exports = {
	bytime: byTime,
	bypage: byPage
};
