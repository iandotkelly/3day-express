/**
 * @description Test for the /api/users API
 */

'use strict';

var request = require('supertest');
var should = require('should');

var app = require('../../app.js'); // this starts the server
var User = require('../../models').User;

describe('POST /api/users', function () {

	describe('with no authorization header', function () {

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
						res.body.message.should.be.equal('Bad request');
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
						console.log(res.body);
						res.body.should.be.an.object;
						res.body.message.should.be.equal('Bad request');
						res.body.reason.should.be.equal(10000);
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
						res.body.message.should.be.equal('Bad request');
						res.body.reason.should.be.equal(10000);
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
						res.body.message.should.be.equal('Username not unique');
						res.body.reason.should.be.equal(15000);
						done();
					});
			});
		});
	});

	describe('with an authorizaton header', function () {

		var user;

		before(function (done) {
			// we need a user
			user = new User({username: 'updateuser', password: 'cats'});
			User.remove({username: 'updateuser'}, function (err) {
				if (err) {
					throw err;
				}
				user.save(function (err) {
					if (err) {
						throw err;
					}
					done();
				});
			});
		});

		after(function (done) {
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
					.post('/api/users')
					.auth('updateuser', 'cats')
					.set('3day-app', 'test')
					.expect(400, done);
			});

			it('should return containing the expected error body', function (done) {
				request(app)
					.post('/api/users')
					.auth('updateuser', 'cats')
					.set('3day-app', 'test')
					.end(function (err, res) {
						should(err).not.exist;
						res.body.should.be.an.object;
						res.body.message.should.be.equal('Bad request');
						res.body.reason.should.be.equal(10000);
						done();
					});
			});
		});

		describe('with wrong authentication', function () {

			it('should return a 401', function (done) {
				request(app)
					.post('/api/users')
					.auth('updateuser', 'catz')
					.set('3day-app', 'test')
					.send({username: 'updatedusername', password: 'fred'})
					.expect(401, done);
			});

			it('should return a response with WWW-Authenticate header', function (done) {
				request(app)
					.post('/api/users')
					.auth('updateuser', 'catz')
					.set('3day-app', 'test')
					.send({username: 'updatedusername', password: 'fred'})
					.end(function (err, res) {
						should(err).not.exist;
						var header = res.headers['www-authenticate'];
						header.should.be.a.string;
						header.should.be.equal('Basic realm="api"');
						done();
					});
			});
		});

		describe('with both username and password', function () {

			it('should update the user', function (done) {
				request(app)
					.post('/api/users')
					.auth('updateuser', 'cats')
					.set('3day-app', 'test')
					.send({username: 'updatedusername', password: 'fred'})
					.end(function (err) {
						should(err).not.exist;
						User.findOne({username: 'updateuser'}, function (err, user) {
							// we expect to not find this user
							should(err).not.exist;
							should(user).not.exist;
							// but we should find the new user - and validate its password
							User.findOne({username: 'updatedusername'}, function (err, user) {
								user.username.should.equal('updatedusername');
								user.validatePassword('fred', function (err, isMatch) {
									should(err).not.exist;
									isMatch.should.be.true;
									done();
								});
							});
						});
					});
			});
		});



	});

});
