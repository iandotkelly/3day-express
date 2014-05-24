/**
 * @description Model for User
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 */

'use strict';

// using mongoose ODM
var mongoose = require('mongoose');
	// bcrypt used to store password hashes
var bcrypt = require('bcrypt');

var indexOfId = require('../lib/indexOfId');
	// the configuration file
var config = require('../config'),
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
		id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
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
	following: [{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		}
	}],
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

  // get the index of the follower
  var index = indexOfId(this.followers, user._id)

  // if we don't find them, then just return
  if (index < 0) {
    return next();
  }

  // otherwise set active state to false and save
  this.followers[index].status.active = false;
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
				self.following.push({
					id: user._id
				});

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
userSchema.methods.deleteFollowing = function(id, next) {

	var self = this;

	User.findOne({
			_id: id
		},
		'_id, followers',
		function(err, following) {
			if (err) {
				return next(err);
			}

			if (!following) {
				err = new Error('username: ' + following + ' not known');
				err.name = 'NotKnown';
				return next(err);
			}

			var index = indexOfId(self.following, following._id);

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
 * Returns an array of all associated IDs
 */
userSchema.methods.allAssociatedIds = function() {

	var id, index, len;
	var ids = {};

	// followers
	for (index = 0, len = this.followers.length; index < len; index++) {
		id = this.followers[index].id;
		if (!ids[id]) {
			ids[id] = true;
		}
	}

	// following
	for (index = 0, len = this.following.length; index < len; index++) {
		id = this.following[index].id;
		if (!ids[id]) {
			ids[id] = true;
		}
	}

	// make array from all the object keys
	var output = [];
	for (var key in ids) {
		if (ids.hasOwnProperty(key)) {
			output.push(key);
		}
	}

	return output;
};

/**
 * Populate the associated users with usernames

 * @param {Function} next Callback
 */
userSchema.methods.populateAssociated = function(next) {

	var ids = this.allAssociatedIds();

	if (ids.length === 0) {
		return next();
	}

	User.find({
			'_id': {
				$in: ids
			},
		},
		'_id, username',
		function(err, associates) {
			if (err) {
				return next(err);
			}

			// iterate over all the users
			for (var associateIndex = 0, associatesLen = associates.length; associateIndex < associatesLen; associateIndex++) {
				var associate = associates[associateIndex];

				for (var index = 0, len = this.followers.index; index < len; index++) {
					var follower = this.followers[index];
					if (associates._id.equals(follower.id)) {
						follower.username = associate.username;
						break;
					}
				}

				for (index = 0, len = this.following.index; index < len; index--) {
					var following = this.following[index];
					if (associates._id.equals(following.id)) {
						following.username = associate.username;
						break;
					}
				}
			}
			next();
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

/**
 * Perform some pre-save implementation
 */
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
