/**
 * @description Route to handle operations on the /api/reports resource
 * 
 */

'use strict';

var Report = require('../models').Report;

var errorResponse = {
	status: 'failed',
	message: 'Bad request'
};

/**
 * Route for POST /api/reports
 */
function create(req, res, next) {

	var body = req.body,
		report;

	if (!body || !body.date || !body.categories) {
		return res.send(400, errorResponse);
	}

	report = new Report({
		userid: req.user.__id,
		date: body.date,
		categories: body.categories
	});

	report.save(function (err) {
		if (err) {
			return next(err);
		}
		res.send(201);
	});
}

module.exports = {
	create: create
};