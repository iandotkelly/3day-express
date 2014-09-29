
/**
 * @description 3-Day Server Application
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var routes = require('./routes');
var http = require('http');
var passport = require('passport');
var app = module.exports = express();
var customHeader = require('./lib/customheader-middleware');
var authenticate = require('./lib/authenticate');
var httpStatus = require('http-status');
var port = process.env.THREEDAY_PORT || 4000;
var path = require('path');

// configure the application port
app.set('port', port);

// set up the logger
app.use(morgan('dev'));

// set the views to be in the views directory
// and use Jade
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// custom middleware to discourage access from non approved clients
app.use(customHeader);

// authentication
app.use(passport.initialize());

// middleware to parse json encoded body
app.use(bodyParser.json());

// development only error handler
if (app.get('env') === 'development') {
	app.use(errorHandler({ dumpExceptions: true, showStack: true }));
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
			res.status(httpStatus.UNAUTHORIZED).end();
		})(req, res, next);
	}

	// unauthenticated - create request
	routes.users.create(req, res, next);
});

/**
 * Non Authentication API
 */

// Users
app.get('/api/users', authenticate(), routes.users.retrieve);
// Following
app.get('/api/following', authenticate(), routes.following.retrieve);
app.post('/api/following/:username', authenticate(), routes.following.create);
app.delete('/api/following/:id', authenticate(), routes.following.remove);
// Followers
app.get('/api/followers', authenticate(), routes.followers.retrieve);
app.post('/api/followers/:id', authenticate(), routes.followers.update);
// Reports
app.post('/api/reports', authenticate(), routes.reports.create);
app.get('/api/reports/:skip/:number', authenticate(), routes.reports.retrieve);
app.get('/api/reports/:number', authenticate(), routes.reports.retrieve);
app.get('/api/reports', authenticate(), routes.reports.retrieve);
app.delete('/api/reports/:id', authenticate(), routes.reports.remove);
app.post('/api/reports/:id', authenticate(), routes.reports.update);
// Report timeline
app.post('/api/timeline', authenticate(), routes.timeline.bypage);
app.post('/api/timeline/:time/:number', authenticate(), routes.timeline.bypage);
app.post('/api/timeline/from/:timefrom/to/:timeto', authenticate(), routes.timeline.bytime);
// Images
app.get('/api/image/:id', authenticate(), routes.images.retrieve);
app.post('/api/image', authenticate(), routes.images.create);
app.delete('/api/image/:id', authenticate(), routes.images.remove);

/**
 * Routes for the jade templates
 */

// serve index and view partials
app.get('/', routes.gui.index);
app.get('/partials/:name', routes.gui.partials);


/**
 * Statically served content
 */

// public resources such as css and images
app.use('/public', express.static('public'));
// bower components
app.use('/component', express.static('bower_components'));
// the angular app - will probably build and copy to public
// at some point in the future
app.use('/app', express.static('app'));


/**
 * Start Server
 */
http.createServer(app).listen(app.get('port'), function () {
	console.log('3DAY app listening on port ' + app.get('port'));
});
