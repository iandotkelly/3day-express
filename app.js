
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
	port = process.env['3DAY_PORT'] || 4000;

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

// the API
app.post('/api/users', routes.users.create); // unauthenticated
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
