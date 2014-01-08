/**
 * @description Middleware handler for the 3day-app header
 */

'use strict';

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

	// currrently we're not logging the contained value
	// just returning non authorized

	if (!expectedHeader) {
		res.setHeader('www-authenticate', 'Basic realm="api"');
		return res.send(STATUS_UNAUTHORIZED);
	}

	next();
}



module.exports = middleware;
