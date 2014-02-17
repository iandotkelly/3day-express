/**
 * @description Test for the /api/users API
 */

'use strict';

var request = require('supertest');
var should = require('should');
var mongoose = require('mongoose');

var app = require('../../app.js'); // this starts the server

var User = require('../../models').User;
var Report = require('../../models').Report;

describe('The images API', function () {

	var user, otherUser, report;

	before(function (done) {
		// ensure the user has been deleted from last tests even if failed
		User.remove({username: 'reportsintegration'}, function (err) {
			if (err) {
				throw err;
			}

			User.remove({username: 'otheruser'}, function (err) {
				if (err) {
					throw err;
				}

				// create a user for all the tests
				user = new User({ username: 'reportsintegration', password: 'catsss' });
				otherUser = new User({ username: 'otheruser', password: 'catsss' });

				user.save(function (err) {
					if (err) {
						throw err;
					}

					otherUser.save(function (err) {
						if (err) {
							throw err;
						}
						// create a report
						report = new Report({
							userid: user._id,
							date: new Date()
						});
						// save the report
						report.save(function (err) {
							if (err) {
								throw err;
							}
							done();
						});
					});
				});
			});
		});
	});

	after(function (done) {
		// delete the user
		user.remove(function (err) {
			if (err) {
				throw err;
			}
			// delete the other user
			otherUser.remove(function (err) {
				if (err) {
					throw err;
				}
				// delete the report
				report.remove(function (err) {
					if (err) {
						throw err;
					}
					done();
				});
			});
		});
	});


	describe('uploads', function () {

		describe('with no image', function () {

			it('should 400', function (done) {

				request(app)
					.post('/api/image')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'catsss')
					.end(function (err, res) {
						should(err).not.exist;
						res.statusCode.should.be.equal(400);
						res.body.should.be.an.object;
						res.body.status.should.be.equal('failed');
						res.body.reason.should.be.equal(20000);
						res.body.message.should.be.equal('No image found');
						done();
					});

			});
		});

		describe('with an image but no metadata', function () {

			it('should 400', function (done) {

				request(app)
					.post('/api/image')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'catsss')
					.set('Content-Type', 'multipart/form-data')
					.attach('image', 'test/fixtures/test.jpg')
					.expect('Content-Type', /json/)
					.end(function (err, res) {
						console.log(res.body);
						should(err).not.exist;
						res.statusCode.should.be.equal(400);
						res.body.should.be.an.object;
						res.body.status.should.be.equal('failed');
						res.body.reason.should.be.equal(10001);
						res.body.message.should.be.equal('No report ID');
						done();
					});

			});
		});


		describe('with an image but bad metadata', function () {

			it('should 400', function (done) {

				request(app)
					.post('/api/image')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'catsss')
					.set('Content-Type', 'multipart/form-data')
					.attach('image', 'test/fixtures/test.jpg')
					.field('metadata', 'thisissomecrappymetadata')
					.expect('Content-Type', /json/)
					.end(function (err, res) {
						console.log(res.body);
						should(err).not.exist;
						res.statusCode.should.be.equal(400);
						res.body.should.be.an.object;
						res.body.status.should.be.equal('failed');
						res.body.reason.should.be.equal(10001);
						res.body.message.should.be.equal('No report ID');
						done();
					});

			});
		});


		describe('with an image, a report id but no report', function () {

			it('should 400', function (done) {

				request(app)
					.post('/api/image')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'catsss')
					.set('Content-Type', 'multipart/form-data')
					.attach('image', 'test/fixtures/test.jpg')
					.field('metadata', JSON.stringify({
						reportid: mongoose.Types.ObjectId()
					}))
					.expect('Content-Type', /json/)
					.end(function (err, res) {
						console.log(res.body);
						should(err).not.exist;
						res.statusCode.should.be.equal(400);
						res.body.should.be.an.object;
						res.body.status.should.be.equal('failed');
						res.body.reason.should.be.equal(20001);
						res.body.message.should.be.equal('Report not found');
						done();
					});

			});
		});
	});
});
