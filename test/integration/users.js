/**
 * @description Test for the /api/users API
 */

'use strict';

var request = require('supertest');
var should = require('should');

var app = require('../../app.js'); // this starts the server

var User = require('../../models').User;

describe('POST /api/users', function () {

	describe('With no body', function () {

		it('should return a 400', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.expect(400, done);
		});

		it('should return contain the expected error body', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.end(function (err, res) {
					should(err).not.exist;
					res.body.should.be.an.object;
					res.body.status.should.be.equal('failed');
					res.body.message.should.be.equal('Bad request');
					res.body.reason.should.be.equal(500);
					done();
				});
		});
	});


	describe('With no username', function () {

		it('should return a 400', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({password: 'cats'})
				.expect(400, done);
		});

		it('should return contain the expected error body', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({password: 'cats'})
				.end(function (err, res) {
					should(err).not.exist;
					res.body.should.be.an.object;
					res.body.status.should.be.equal('failed');
					res.body.message.should.be.equal('Bad request');
					res.body.reason.should.be.equal(500);
					done();
				});
		});
	});


	describe('With no password', function () {

		it('should return a 400', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({username: 'ian'})
				.expect(400, done);
		});

		it('should return contain the expected error body', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({username: 'ian'})
				.end(function (err, res) {
					should(err).not.exist;
					res.body.should.be.an.object;
					res.body.status.should.be.equal('failed');
					res.body.message.should.be.equal('Bad request');
					res.body.reason.should.be.equal(500);
					done();
				});
		});
	});

	describe('With both username and password', function () {

		// make sure no pre-existing user is there
		beforeEach(function (done) {
			User.remove({username: 'integrationtest'}, function () {
				done();
			});
		});

		// remove user after each test
		afterEach(function (done) {
			User.remove({username: 'integrationtest'}, function () {
				done();
			});
		});

		it('should return a 201', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({username: 'integrationtest', password: 'cats'})
				.expect(201, done);
		});

		it('should create the user', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({username: 'integrationtest', password: 'cats'})
				.end(function (err) {
					should(err).not.exist;
					User.findOne({username: 'integrationtest'}, function (err, user) {
						should(err).not.exist;
						user.username.should.equal('integrationtest');
						user.validatePassword('cats', function (err, isMatch) {
							should(err).not.exist;
							isMatch.should.be.true;
							done();
						});
					});
				});
		});
	});


	describe('where a user of the same name exists', function () {

		// ensure a pre-existing user exists
		beforeEach(function (done) {
			User.remove({username: 'preexisting'}, function () {
				var user = new User({username: 'preexisting', password: 'cats'});
				user.save(function (err) {
					if (err) {
						throw err;
					}
					done();
				});
			});
		});

		// remove user after each test
		afterEach(function (done) {
			User.remove({username: 'preexisting'}, function () {
				done();
			});
		});

		it('should return a 400', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({username: 'preexisting', password: 'cats'})
				.expect(400, done);
		});

		it('should return contain the expected error body', function (done) {
			request(app)
				.post('/api/users')
				.set('3day-app', 'test')
				.send({username: 'preexisting', password: 'cats'})
				.end(function (err, res) {
					should(err).not.exist;
					res.body.should.be.an.object;
					res.body.status.should.be.equal('failed');
					res.body.message.should.be.equal('Username not unique');
					res.body.reason.should.be.equal(100);
					done();
				});
		});
	});
});