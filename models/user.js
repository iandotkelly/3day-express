
'use strict';

/**
 * @description Model for User
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 */

	// using mongoose ODM
var mongoose = require('mongoose'),
	// bcrypt used to store password hashes
	bcrypt = require('bcrypt'),
	// the configuration file
	config = require('../config'),
	// work factor for password encryption
	SALT_WORK_FACTOR = 10,
	db,
	userSchema;

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

// connect to the database
mongoose.connect(config.database);
db = mongoose.connection;

// register function to run on save to process the password
userSchema.pre('save', function (next) {
	var user = this;

	// update the created/updated
	user.updated = new Date();
	if (!user.created) {
		user.created = user.updated;
	}

	if (!user.isModified('password')) {
		return next();
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
