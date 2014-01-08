/**
 * @description Test for the
 */

'use strict';

var request = require('supertest');
var should = require('should');
var User = require('../../models').User;

var app = require('../../app.js'); // this starts the server

describe('With incorrect username and password', function () {

	describe('the users API', function () {

		it('should return a 401', function (done) {
			request(app)
				.get('/api/users')
				.set('3day-app', 'test')
				.auth('incorrect', 'credentials')
				.expect(401, done);
		});

		it('should issue an authentication challenge', function (done) {
			request(app)
				.get('/api/users')
				.set('3day-app', 'test')
				.auth('incorrect', 'credentials')
				.end(function (err, response) {
					should(err).not.exit;
					var header = response.header['www-authenticate'];
					header.should.be.equal('Basic realm="api"');
					done();
				});
		});
	});

});


describe('With incorrect password', function () {

	var testUser;

	before(function (done) {
		// create user
		testUser = new User({
			username: 'testapi',
			password: 'genius'
		});
		testUser.save(function (err) {
			if (err) {
				throw err;
			}
			done();
		});
	});

	after(function () {
		testUser.remove(function (err) {
			if (err) {
				throw err;
			}
		});
	});

	describe('the users API', function () {

		it('should return a 401', function (done) {
			request(app)
				.get('/api/users')
				.set('3day-app', 'test')
				.auth('testapi', 'cats')
				.expect(401, done);
		});


		it('should issue an authentication challenge', function (done) {
			request(app)
				.get('/api/users')
				.set('3day-app', 'test')
				.auth('incorrect', 'credentials')
				.end(function (err, response) {
					should(err).not.exit;
					var header = response.header['www-authenticate'];
					header.should.be.equal('Basic realm="api"');
					done();
				});
		});
	});
});


describe('With no api key', function () {

	var testUser;

	before(function () {
		// create user
		testUser = new User({
			username: 'testapi',
			password: 'genius'
		});
	});

	after(function () {
		testUser.remove(function (err) {
			if (err) {
				throw err;
			}
		});
	});

	describe('the users API', function () {

		it('should return a 401', function (done) {
			request(app)
				.get('/api/users')
				.auth('testapi', 'genius')
				.expect(401, done);
		});

		it('should issue an authentication challenge', function (done) {
			request(app)
				.get('/api/users')
				.set('3day-app', 'test')
				.auth('incorrect', 'credentials')
				.end(function (err, response) {
					should(err).not.exit;
					var header = response.header['www-authenticate'];
					header.should.be.equal('Basic realm="api"');
					done();
				});
		});
	});
});


describe('With correct api-key and a valid user/password combination',
	function () {

	var testUser;

	before(function (done) {
		// create user
		testUser = new User({
			username: 'testapi',
			password: 'genius'
		});
		testUser.save(function (err) {
			if (err) {
				throw err;
			}
			done();
		});
	});

	after(function () {
		testUser.remove(function (err) {
			if (err) {
				throw err;
			}
		});
	});

	describe('the users API', function () {

		it('should return a 200 containing JSON', function (done) {
			request(app)
				.get('/api/users')
				.auth('testapi', 'genius')
				.set('3day-app', 'test')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('should contain a response body with the user profile',
			function (done) {
			request(app)
				.get('/api/users')
				.auth('testapi', 'genius')
				.set('3day-app', 'test')
				.expect('Content-Type', /json/)
				.end(function (err, response) {
					should(err).not.exist;
					response.should.be.an.object;
					response.body.should.be.an.object;
					response.body.username.should.be.equal('testapi');
					// but no password in the response
					should(response.body.password).not.exist;
					done();
				});
		});
	});
});
