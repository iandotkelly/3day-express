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
		report;

	if (!body || !body.date || !body.categories) {
		return res.json(httpStatus.BAD_REQUEST, errorResponse);
	}

	report = new Report({
		userid: req.user._id,
		date: body.date,
		categories: body.categories
	});

	report.save(function (err) {
		if (err) {
			return next(err);
		}
		res.json(httpStatus.CREATED, {
			message: 'Created'
		});
	});
}

/**
 * Route for GET /api/reports/:skip/:number
 */
function retrieve(req, res, next) {

	var skip = req.params.skip || 0,
		limit = req.params.number || 1;

	Report.find(
		{
			userid: req.user._id
		},
		'-__v',
		{
			skip: skip,
			limit: limit,
			sort: {
				date: -1		// sort by report date DESC
			}
		},
		function (err, reports) {
			if (err) {
				return next(err);
			}
			res.send(httpStatus.OK, reports);
		});
}

/**
 * Route for POST /api/reports/:id
 */
function update(req, res, next) {
	throw new Error('not implemented');
}

/**
 * Route for DELETE /api/reports/:id
 */
function del(req, res, next) {
	throw new Error('not implemented');
}

module.exports = {
	create: create,
	retrieve: retrieve,
	update: update,
	del: del
};
