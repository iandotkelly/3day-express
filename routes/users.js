/**
 * @description Route to handle operations on the /users resource
 * 
 */

'use strict';

function retrieve(req, res) {

	// if we have got to this point we already have our user
	// but we will reformat slightly rather than refetch as a lean
	// object from the db
	var user = {
		id: req.user._id,
		username: req.user.username
	};

	res.send(200, user);
}

module.exports = {
	create: function () {},
	retrieve: retrieve
};