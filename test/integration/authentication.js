/**
 * @description Test for the 
 */

'use strict';

var request = require('supertest');
var should = require('should');

var app = require('../../app.js'); // this starts the server

describe('With incorrect username or password', function () {

	describe('the users API', function () {

		it('should error', function (done) {
			request(app)
				.get('/users')
				.set('x-3day', 'api')
				.auth('incorrect', 'credentials')
				.expect('Content-Type', /json/)
				.expect(401)
				.end(function (err, res) {
					should(err).not.exist;
					res.should.exist;
					done();
				});
		});
	});
 
});


describe('With incorrect api key', function () {

	describe('the users API', function () {

		it('should error', function (done) {
			request(app)
				.get('/users')
				.set('x-3day', 'api')
				.auth('incorrect', 'credentials')
				.expect(401, done);
		});
	});
 
});

describe('With no api key', function () {

	describe('the users API', function () {

		it('should error', function (done) {
			request(app)
				.get('/users')
				.auth('incorrect', 'credentials')
				.expect(401, done);
		});
	});
 
});