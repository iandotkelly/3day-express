/**
 * @description Test for the 
 */

'use strict';

var request = require('supertest');
var should = require('should');

var app = require('../../app.js'); // this starts the server

describe('With incorrect username or password', function () {

	describe('the users API', function () {

		it('should return a 401 containing json', function (done) {
			request(app)
				.get('/users')
				.set('3day-app', 'test')
				.auth('incorrect', 'credentials')
				.expect('Content-Type', /json/)
				.expect(401, done);
		});


		it('should contain a response body with an error report',
			function (done) {
			request(app)
				.get('/users')
				.set('3day-app', 'test')
				.auth('incorrect', 'credentials')
				.expect('Content-Type', /json/)
				.end(function (err, response) {
					should(err).not.exist;
					response.should.be.an.object;
					response.body.should.be.an.object;
					response.body.status.should.be.equal('failed');
					response.body.message.should.be.equal('Not Authorized');
					done();
				});
		});
	});
 
});

describe('With no api key', function () {

	describe('the users API', function () {

		it('should return a 401', function (done) {
			request(app)
				.get('/users')
				.auth('sampleuser', 'samplepassword')
				.expect('Content-Type', /json/)
				.expect(401, done);
		});

		it('should contain a response body with an error report',
			function (done) {
			request(app)
				.get('/users')
				.auth('sampleuser', 'samplepassword')
				.expect('Content-Type', /json/)
				.end(function (err, response) {
					should(err).not.exist;
					response.should.be.an.object;
					response.body.should.be.an.object;
					response.body.status.should.be.equal('failed');
					response.body.message.should.be.equal('Not Authorized');
					done();
				});
		});
	});
});