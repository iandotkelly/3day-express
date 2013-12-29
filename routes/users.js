/**
 * @description Route to handle operations on the /users resource
 * 
 */

'use strict';

var User = require('../models').User;

/**
 * Route for POST /api/users
 */
function create(req, res) {

	var body = req.body,
		user;

	// do we have the appropriate parameters?
	if (!body || !body.username || !body.password) {
		return res.send(400, {
			status: 'failed',
			reason: 500,
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
				return res.send(400, {
					status: 'failed',
					reason: 100,
					message: 'Username not unique'
				});
			}
		} else {
			res.send(201);
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

	res.send(200, user);
}

module.exports = {
	create: create,
	retrieve: retrieve
};