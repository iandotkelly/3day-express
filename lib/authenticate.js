/**
 * @description Sets up the basic authentication strategy of the application
 *
 * @author Ian Kelly
 */

'use strict';

var passport = require('passport'),
	User = require('../models').User,
	BasicStrategy = require('passport-http').BasicStrategy;

// configure passport to use the mongodb users to find the
// user making the request
passport.use(new BasicStrategy(
	function (username, password, done) {

		// attempt to retrieve and validate the user
		User.findOne(
			{ username: username },
			'-__v',

			function (err, user) {
				// error when finding user
				if (err) {
					return done(err);
				}

				// user not known
				if (!user) {
					return done(null, false);
				}

				// validate the password
				user.validatePassword(password, function (err, isMatch) {

					// error validating password
					if (err) {
						return done(err);
					}

					// password matches
					if (isMatch) {
						return done(null, user);
					}

					// password does not match
					return done(null, false);
				});

			});
	}
));

/**
 * Authenticate a request
 */
function authenticate() {
	return passport.authenticate('basic', { session : false });
}

module.exports = authenticate;