
/**
 * @description 3-Day Server Application
 */

'use strict';

var express = require('express'),
	routes = require('./routes'),
	http = require('http'),
	passport = require('passport'),
	app = module.exports = express(),
	customHeader = require('./lib/customheader-middleware'),
	authenticate = require('./lib/authenticate'),
	port = process.env['THREEDAY_PORT'] || 4000;

// configure the application port
app.set('port', port);

// set up the logger
app.use(express.logger());

// custom middleware to discourage access from non approved clients
app.use(customHeader);

// authentication
app.use(passport.initialize());

// middleware to parse json encoded body
app.use(express.json());
app.use(express.urlencoded());

// router
app.use(app.router);

// development only error handler
if (app.get('env') === 'development') {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

/**
 * Routes
 */

// public resources - we may want a simple file server
app.use('/public', express.static('public'));

// user creation and update
app.post('/api/users', function (req, res, next) {
	// client passing authorization header - update request
	if (req.headers.authorization) {
		return passport.authenticate('basic', function (err, user) {
			if (err) {
				return next(err);
			}
			if (user) {
				req.user = user;
				return routes.users.update(req, res, next);
			}
			// need to handle the 401 response explicitly
			// not just leave this to passport.js to do
			res.setHeader('www-authenticate', 'Basic realm="api"');
			res.send(401);
		})(req, res, next);
	}

	// unauthenticated - create request
	routes.users.create(req, res, next);
});

// the API
app.get('/api/users', authenticate(), routes.users.retrieve);
app.post('/api/reports', authenticate(), routes.reports.create);
app.get('/api/reports/:skip/:number', authenticate(), routes.reports.retrieve);
app.get('/api/reports/:number', authenticate(), routes.reports.retrieve);
app.get('/api/reports', authenticate(), routes.reports.retrieve);

/**
 * Start Server
 */
http.createServer(app).listen(app.get('port'), function () {
	console.log('3DAY applistening on port ' + app.get('port'));
});
