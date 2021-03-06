/**
 * @description Route to handle operations on the /following resource
 *
 * @copyright Copyright (c) Ian Kelly
 */

'use strict';

var httpStatus = require('http-status');
var ObjectId = require('mongoose').Types.ObjectId;
var User = require('../models/user');

/**
 * Add a person you are following
 */
function create(req, res, next) {

	req.user.addFollowing(req.params.username, function(err, user) {

		if (err) {
			if (err.name === 'NotFound') {
				// ok - so we don't know this person
				return res.status(httpStatus.NOT_FOUND).json({
					status: 'failed',
					message: 'Not found'
				});
			} else {
				// true error - oops
				return next(err);
			}
		}

		// ok, we're home and dry
		res.status(httpStatus.OK).json({
			status: 'success',
			message: 'friend added',
			id: user._id
		});
	});
}

/**
 * Retrieve a list of all the people a user is following
 */
function retrieve(req, res, next) {

	var user = req.user.toObject();
	// add usernames
	User.addUsername(user.following || [], function(err) {
		if (err) {
			return next(err);
		}
		return res.status(httpStatus.OK).json(user.following);
	});
}

/**
 * Remove someone we are following
 */
function remove(req, res, next) {

	var id;
	try {
		id = new ObjectId(req.params.id);
	} catch (err) {
		// this isn't a valid ID
		return res.status(httpStatus.BAD_REQUEST).json({
			status: 'failed',
			message: 'Invalid ID format'
		});
	}

	req.user.removeFollowing(id, function(err) {
		if (err) {
			if (err.name === 'NotFollowing' || err.name === 'NotKnown') {
				// ok - so we don't know this user
				return res.status(httpStatus.NOT_FOUND).json({
					status: 'failed',
					message: 'Not found'
				});
			} else {
				// true error - oops
				return next(err);
			}
		}

		res.status(httpStatus.OK).json({
			status: 'success'
		});
	});
}

module.exports = {
	create: create,
	retrieve: retrieve,
	remove: remove
};
