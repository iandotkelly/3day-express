/**
 * @description Model for User
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 */

'use strict';

// using mongoose ODM
var mongoose = require('mongoose'),
	// bcrypt used to store password hashes
	bcrypt = require('bcrypt'),
	// the configuration file
	config = require('../config'),
	// constants
	reasonCodes = require('../lib/constants').reasonCodes,
	// work factor for password encryption
	SALT_WORK_FACTOR = 10,
	db,
	userSchema,
	usernameValidation = /^[a-zA-Z0-9_-]{4,20}$/,
	passwordValidation = /^[^\s]{6,20}$/;

// spoof a mongoose validation error for the password validation
var passwordValidationError = new Error();
passwordValidationError.name = 'ValidationError';
passwordValidationError.errors = {
	password: {
		message: '15002'
	}
};


var userSchema = mongoose.Schema({
	// the compulsory authentication fields
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	// the last updated field - defaults to January 1, 1970
	latest: {
		type: Date,
		default: new Date(0)
	},
	// followers
	followers: [{
		id: mongoose.Schema.Types.ObjectId,
		status: {
			active: {
				type: Boolean,
				default: true
			},
			approved: {
				type: Boolean,
				default: true
			},
			blocked: {
				type: Boolean,
				default: false
			}
		}
	}],
	// following
	following: [mongoose.Schema.Types.ObjectId],
	// whether to auto-approve followers
	autoApprove: {
		type: Boolean,
		default: true
	},
	// default created / updated
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date,
		default: Date.now
	}
});

/**
 * Compares a password
 *
 * @param  {String}   password The candidate password
 * @param  {Function} next     Callback (err, isMatch)
 */
userSchema.methods.validatePassword = function(password, next) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err) {
			return next(err);
		}
		next(null, isMatch);
	});
};

/**
 * Sets the latest change to the user's data
 *
 * @param {Function} next Callback (err)
 */
userSchema.methods.setLatest = function(next) {

	// set the object's latest to now
	var now = Date.now();
	this.latest = now;

	// rather than write out in a full save - just update
	// the property in the document
	this.update({
		latest: now
	}, function(err, numberAffected) {
		if (err) {
			return next(err);
		}

		if (numberAffected !== 1) {
			return next(
				new Error('Unexpected number of affected records: ' +
					numberAffected)
			);
		}
		next();
	});
};

/**
 * Add a follower

 * @param {Object}   user The user to add as a follower
 * @param {Function} next Callback
 */
userSchema.methods.addFollower = function(user, next) {

	// look for the follower in the collection already
	for (var i = 0; i < this.followers.length; i++) {
		var follower = this.followers[i];

		if (follower.id === user._id) {
			// return - do nothing
			return next();
		}
	}

	this.followers.push({
		id: user._id,
		status: {
			active: true,
			approved: this.autoApprove,
			blocked: false
		}
	});

	this.save(next);
};

/**
 * Remove a follower - i.e. mark as inactive
 *
 * @param {Object}   user The user to mark as inactive
 * @param {Function} next Callback
 */
userSchema.methods.removeFollower = function(user, next) {

    console.log(user._id);

	// look for the follower in the collection already
	for (var i = 0; i < this.followers.length; i++) {
		var follower = this.followers[i];

		if (follower.id.equals(user._id)) {
			follower.status.active = false;
			break;
		}
	}

	this.save(next);
};

/**
 * Add a following by user-id
 *
 * @param {String}   other      The username of the new person to follow
 * @param {Object}   status     The status flags of the user
 * @param {Function} next       Callback (err)
 */
userSchema.methods.addFollowing = function(username, next) {

	if (typeof username !== 'string') {
		return next(new Error('username should be a string'));
	}

	var self = this;

	// find the person you wish to follow
	User.findOne({
			username: username
		},
		'-__v',
		function(err, user) {

			// error when finding user
			if (err) {
				return next(err);
			}

			// user not known at all
			if (!user) {
				var error = new Error('username:' + username + ' not found');
				error.name = 'NotFound';
				return next(error);
			}

			// only add the user if its not there already
			if (self.following.indexOf(user._id) >= 0) {
				return next(null, user);
			}

			// add us to the user's followers
			user.addFollower(self, function(err) {
				if (err) {
					return next(err);
				}

				// add us as following
				self.following.push(user._id);

				self.save(function(err) {
					if (err) {
						return next(err);
					}
					return next(null, user);
				});
			});

		}
	);
};

/**
 * Delete a follower by user-id
 *
 * @param {Srtring}  other The username of the friend
 * @param {Function} next  Callback (err)
 */
userSchema.methods.deleteFollowing = function(username, next) {

	if (typeof username !== 'string') {
		return next(new Error('username should be a string'));
	}

	var self = this;

	User.findOne({
			username: username
		},
		'_id, followers',
		function(err, following) {
			if (err) {
				console.log(err);
				return next(err);
			}

			if (!following) {
				err = new Error('username: ' + following + ' not known');
				err.name = 'NotKnown';
				return next(err);
			}

			var index = self.following.indexOf(following._id);

			if (index < 0) {
				err = new Error('username: ' + following + ' was not being followed');
				err.name = 'NotFollowing';
				return next(err);
			}

			self.following.splice(index, 1);

			// we need to mark the person following as inactive
			following.removeFollower(self, function(err) {
				if (err) {
					return next(err);
				}
				// finally we should save this
				self.save(next);
			});

		});

};

/**
 * Validation Methods
 */

// Ensure username is adequate length and characters
userSchema.path('username').validate(function(value) {
	return usernameValidation.test(value);
}, reasonCodes.USERNAME_INVALID.toString());


// connect to the database
mongoose.connect(config.database);
db = mongoose.connection;

// register function to run on save to process the password
userSchema.pre('save', function(next) {
	var user = this;

	// refresh the updated property
	user.updated = Date.now();

	if (!user.isModified('password')) {
		return next();
	}

	// validation has to happen here
	if (!passwordValidation.test(user.password)) {
		return next(passwordValidationError);
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) {
			return next(err);
		}

		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

db.on('error', function(err) {
	// @todo something more elegant than log to console
	console.log(err);
});

// we are exporting the mongoose model
var User = mongoose.model('User', userSchema);
module.exports = User;
