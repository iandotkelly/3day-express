/**
 * @description Route to handle operations on the /users resource
 *
 */

'use strict';

var User = require('../models').User;
var httpStatus = require('http-status');
var reasonCodes = require('../lib/constants').reasonCodes;

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
		if (err) {
			// look for a duplicate user
			if (err.code && (err.code === 11001 || err.code === 11000)) {
				return res.send(httpStatus.BAD_REQUEST, {
					reason: reasonCodes.USERNAME_NOT_UNIQUE,
					message: 'Username not unique'
				});
			}
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
function create(req, res) {

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
		if (err) {
			// look for a duplicate user
			if (err.code && err.code === 11000) {
				return res.send(httpStatus.BAD_REQUEST, {
					reason: reasonCodes.USERNAME_NOT_UNIQUE,
					message: 'Username not unique'
				});
			}
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
function retrieve(req, res) {

	// if we have got to this point we already have our user
	// but we will reformat slightly rather than refetch as a lean
	// object from the db
	var user = {
		id: req.user._id,
		username: req.user.username
	};

	res.send(httpStatus.OK, user);
}


module.exports = {
	create: create,
	retrieve: retrieve,
	update: update
};
