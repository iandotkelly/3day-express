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
	.sort('-date')
	.limit(1000)
	.exec(function (err, docs) {
		if (err) {
			return next(err);
		}

		return res.json(httpStatus.OK, docs);
	});
}


//app.post('/api/timeline/:time/:number', authenticate(), routes.timeline.bypage);
// real time
function byPage(req, res, next) {

	var time = req.params.time;
	var number = req.params.number;
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
		'created': {
			$lte: time
		}
	})
	.sort('-date')
	.limit(number)
	.exec(function (err, docs) {
		if (err) {
			return next(err);
		}

		return res.json(httpStatus.OK, docs);
	});
}

module.exports = {
	bytime: byTime,
	bypage: byPage
};
