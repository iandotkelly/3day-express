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
passwordValidationError.errors = { password: { message: '15002' } };


var userSchema = mongoose.Schema({
	// the compulsory authentication fields
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	// default created / updated
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now }
});

/**
 * Compares a password
 *
 * @param  {String}   password The candidate password
 * @param  {Function} next     Callback (err, isMatch)
 */
userSchema.methods.validatePassword = function (password, next) {
	bcrypt.compare(password, this.password, function (err, isMatch) {
		if (err) {
			return next(err);
		}
		next(null, isMatch);
	});
};

/**
 * Validation Methods
 */

// Ensure username is adequate length and characters
userSchema.path('username').validate(function (value) {
	return usernameValidation.test(value);
}, reasonCodes.USERNAME_INVALID.toString());


// connect to the database
mongoose.connect(config.database);
db = mongoose.connection;

// register function to run on save to process the password
userSchema.pre('save', function (next) {
	var user = this;

	// refresh the updated property
	user.updated = Date.now;

	if (!user.isModified('password')) {
		return next();
	}

	// validation has to happen here
	if (!passwordValidation.test(user.password)) {
		return next(passwordValidationError);
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
			if (err) {
				return next(err);
			}

			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
});

db.on('error', function (err) {
	// @todo something more elegant than log to console
	console.log(err);
});

// we are exporting the mongoose model
module.exports = mongoose.model('User', userSchema);
