/**
 * @description Sets up the basic authentication strategy of the application
 *
 * @author Ian Kelly
 */

'use strict';

var passport = require('passport'),
	User = require('../models').User,
	BasicStrategy = require('passport-http').BasicStrategy,
	unauthorizedResponse;

unauthorizedResponse = {
	message: 'Unauthorized'
};

// configure passport to use the mongodb users to find the
// user making the request
passport.use(new BasicStrategy(
	{
		realm: 'api'
	},
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
					return done(null, false, unauthorizedResponse);
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
					return done(null, false, unauthorizedResponse);
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
