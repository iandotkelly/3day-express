/* jshint -W098*/

/**
 * @description Route to handle operations on the /api/reports resource
 *
 * @author - Ian Kelly
 */

'use strict';

var Report = require('../models').Report;
var httpStatus = require('http-status');
var constants = require('../lib/constants');

var errorResponse = {
	reason: constants.BAD_SYNTAX,
	message: 'Bad request'
};

/**
 * Route for POST /api/reports
 */
function create(req, res, next) {

	var body = req.body,
		user = req.user,
		report;

	if (!body || !body.date || !body.categories) {
		return res.status(httpStatus.BAD_REQUEST).json(errorResponse);
	}

	report = new Report({
		userid: user._id,
		date: body.date,
		categories: body.categories
	});

	// save the report
	report.save(function (err) {
		if (err) {
			return next(err);
		}

		// update the user latest
		user.setLatest(function (err) {
			if (err) {
				return next(err);
			}

			// return a successful response
			res.status(httpStatus.CREATED).json({
				message: 'Created'
			});
		});
	});
}

/**
 * Route for GET /api/reports/:skip/:number
 */
function retrieve(req, res, next) {

	var skip = req.params.skip || 0,
		limit = req.params.number || 1;

	Report.find({
			userid: req.user._id
		},
		'-__v', {
			skip: skip,
			limit: limit,
			sort: {
				date: -1 // sort by report date DESC
			}
		},
		function (err, reports) {
			if (err) {
				return next(err);
			}
			res.status(httpStatus.OK).json(reports);
		});
}

/**
 * Route for POST /api/reports/:id
 */
function update(req, res, next) {

	var id = req.params.id,
		user = req.user,
		body = req.body;

	if (!body || !body.date || !body.categories) {
		return res.status(httpStatus.BAD_REQUEST).json(errorResponse);
	}

	Report.findByIdAndUpdate(id, body, function (err, report) {
		if (err) {
			return next(err);
		}
		if (report) {

			// update the user latest
			return user.setLatest(function (err) {
				if (err) {
					return next(err);
				}

				res.status(httpStatus.OK).send({
					message: 'Updated'
				});
			});

		}
		res.status(httpStatus.NOT_FOUND).json({
			message: 'Not Found'
		});
	});
}

/**
 * Route for DELETE /api/reports/:id
 */
function remove(req, res, next) {

	var id = req.params.id;

	Report.findByIdAndRemove(id, function (err, report) {
		if (err) {
			return next(err);
		}
		if (report) {
			return res.status(httpStatus.OK).json({
				message: 'Deleted'
			});
		}
		res.status(httpStatus.NOT_FOUND).json({
			message: 'Not Found'
		});
	});
}

module.exports = {
	create: create,
	retrieve: retrieve,
	update: update,
	remove: remove
};
