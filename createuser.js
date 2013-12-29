'use strict';

var User = require('./models').User;

var user = new User({username: 'ian', password: 'cats'});

user.save(function (err) {
	if (err) {
		throw err;
	}
});