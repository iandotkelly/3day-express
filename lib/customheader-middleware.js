/**
 * @description Middleware handler for the 3day-app header
 */

'use strict';

var accepts = require('accepts');
var STATUS_UNAUTHORIZED = require('http-status').UNAUTHORIZED;

/**
 * Middleware function to intercept and respond to the
 * 3day-app header
 *
 * @param  {Object}   req  Request
 * @param  {Object}   res  Response
 * @param  {Function} next Callback
 */
function middleware(req, res, next) {

	var expectedHeader = req.headers['3day-app'];

	// quick and dirty hack to stop it blocking browsers
	var clientAccepts = accepts(req);
	var acceptsJsonButNotHtml = clientAccepts.types('json') === 'json' && !clientAccepts.types('html');

	// currrently we're not logging the contained value
	// just returning non authorized
	if (acceptsJsonButNotHtml && !expectedHeader) {
		return res.send(STATUS_UNAUTHORIZED);
	}

	next();
}

module.exports = middleware;
