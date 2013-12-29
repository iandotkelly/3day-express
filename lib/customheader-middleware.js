/** 
 * @description 
 */

'use strict';

var unauthorizedBody = {
	status: 'failed',
	message: 'Not Authorized'
};

/**
 * [middleware description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function middleware(req, res, next) {

	var expectedHeader = req.headers['3day-app'];

	// currrently we're not logging the contained value
	// just returning non authorized

	if (!expectedHeader) {
		return res.send(401, unauthorizedBody);
	}

	next();
}



module.exports = middleware;