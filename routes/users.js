/**
 * @description Route to handle operations on the /users resource
 *
 * @copyright Copyright (c) Ian Kelly
 */

'use strict';

var User = require('../models').User;
var Report = require('../models').Report;
var httpStatus = require('http-status');
var reasonCodes = require('../lib/constants').reasonCodes;


/**
 * Processes a Save Error
 *
 * @param  {Error} err  An error returned from Mongoose
 * @return {Object}     The message to return by the API, or Undefined if none
 */
function processSaveError(err) {

	// duplicate username
	if (err.code && (err.code === 11000 || err.code === 11001)) {
		return {
			reason: reasonCodes.USERNAME_NOT_UNIQUE,
			message: 'Username not unique'
		};
	}

	// its a schema validation message
	if (err.name && err.name === 'ValidationError') {
		// if it relates to the username
		if (err.errors && err.errors.username) {
			return {
				reason: reasonCodes.USERNAME_INVALID,
				message: 'Username does not meet minimum standards'
			};
		}
		// if it relates to the password
		if (err.errors && err.errors.password) {
			return {
				reason: reasonCodes.PASSWORD_INVALID,
				message: 'Password does not meet minimum standards'
			};
		}
	}

	// else we will return falsey
}

/**
 * Route for POST /api/users - Authenticated
 */
function update(req, res, next) {

	var body = req.body,
		user = req.user;

	// the update needs to have either an updated username
	// or an updated password
	if (!body || (!body.username && !body.password)) {
		return res.send(httpStatus.BAD_REQUEST, {
			reason: reasonCodes.BAD_SYNTAX,
			message: 'Bad request'
		});
	}

	if (body.username) {
		user.username = body.username;
	}

	if (body.password) {
		user.password = body.password;
	}

	user.save(function (err) {

		var saveError;

		if (err) {

			// if its a known validation error then return a
			// a bad request
			saveError = processSaveError(err);
			if (saveError) {
				return res.send(httpStatus.BAD_REQUEST, saveError);
			}

			// ok - this is a genuine exception - return a 500
			return next(err);

		}
		res.json(httpStatus.OK, {
			message: 'Updated'
		});
	});
}

/**
 * Route for POST /api/users - Not Authenticated
 */
function create(req, res, next) {

	var body = req.body,
		user;

	// do we have the appropriate parameters?
	if (!body || !body.username || !body.password) {
		return res.send(httpStatus.BAD_REQUEST, {
			reason: reasonCodes.BAD_SYNTAX,
			message: 'Bad request'
		});
	}

	user = new User({
		username: body.username,
		password: body.password
	});

	user.save(function (err) {

		var saveError;

		if (err) {

			// if its a known validation error then return a
			// a bad request
			saveError = processSaveError(err);
			if (saveError) {
				return res.send(httpStatus.BAD_REQUEST, saveError);
			}

			// ok - this is a genuine exception - return a 500
			return next(err);

		} else {
			res.send(httpStatus.CREATED, {
				message: 'Created'
			});
		}
	});
}


/**
 * Route for GET /api/users - returns the current user's profile
 */
function retrieve(req, res, next) {

	var reqUser = req.user;

	// if we have got to this point we already have our user
	// but we will reformat slightly rather than refetch as a lean
	// object from the db
	var user = {
		id: reqUser._id,
		username: reqUser.username,
		following: reqUser.following,
		followers: reqUser.followers,
		autoApprove: reqUser.autoApprove
	};

	// retrieve report count
	Report.count({userid: user.id}, function (err, count) {
		if (err) {
			// this is a genuine exception
			return next(err);
		}

		user.reportCount = count;
		res.send(httpStatus.OK, user);
	});
}


module.exports = {
	create: create,
	retrieve: retrieve,
	update: update
};
