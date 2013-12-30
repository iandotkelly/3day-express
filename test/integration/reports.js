/**
 * @description Test for the /api/users API
 */

'use strict';

var request = require('supertest');
var should = require('should');

var app = require('../../app.js'); // this starts the server

var User = require('../../models').User;
//var Report = require('../../models').Report;

describe('POST /api/reports', function () {

	var user;

	before(function (done) {
		// create a user for all the tests
		user = new User({ username: 'reportsintegration', password: 'cats' });
		user.save(function (err) {
			if (err) {
				throw err;
			}
			done();
		});
	});

	after(function (done) {
		// delete the user
		user.remove(function (err) {
			if (err) {
				throw err;
			}
			done();
		});
	});

	describe('with no body', function () {

		it('should return a 400', function (done) {
			request(app)
				.post('/api/reports')
				.set('3day-app', 'test')
				.auth('reportsintegration', 'cats')
				.expect(400, done);
		});

		it('should return contain the expected error body', function (done) {
			request(app)
				.post('/api/reports')
				.set('3day-app', 'test')
				.auth('reportsintegration', 'cats')
				.end(function (err, res) {
					should(err).not.exist;
					res.body.should.be.an.object;
					res.body.status.should.be.equal('failed');
					res.body.message.should.be.equal('Bad request');
					done();
				});
		});
	});

});