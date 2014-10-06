/**
 * @description Sets up the basic authentication strategy of the application
 *
 * @author Ian Kelly
 */

'use strict';

var passport = require('passport');
var User = require('../models').User;
var BasicStrategy = require('passport-http').BasicStrategy;

var unauthorizedResponse = {
	message: 'Unauthorized'
};

// configure passport to use the mongodb users to find the
// user making the request
passport.use(new BasicStrategy(function (username, password, done) {
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
 * Custom middleware to authenticate our user
 */
function authenticate(req, res, next) {

	// no session required as this is an API
	passport.authenticate('basic', { session: false }, function (err, user) {
		if (err) {
			return next(err);
		}

		// if there is no user we return a 401, but we do not
		// set the WWW-Authenticate header as this forces the browser
		// to show the basic auth login dialog
		if (!user) {
			return res.status(401).json({
				status: 'failed',
				message: 'unauthenticated'
			});
		}

		// on success, just append the user to the request
		// and chain to the next middleware
		req.user = user;
		next();

 	})(req, res, next);

}

module.exports = authenticate;
