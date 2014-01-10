/**
 * @description Test for the /api/users API
 */

'use strict';

var request = require('supertest');
var should = require('should');

var app = require('../../app.js'); // this starts the server

var User = require('../../models').User;
var Report = require('../../models').Report;

describe('The Reports API', function () {

	var user;

	before(function (done) {
		// ensure the user has been deleted from last tests even if failed
		User.remove({username: 'reportsintegration'}, function (err) {
			if (err) {
				throw err;
			}

			// create a user for all the tests
			user = new User({ username: 'reportsintegration', password: 'cats' });
			user.save(function (err) {
				if (err) {
					throw err;
				}
				done();
			});
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

	describe('GET /api/reports', function () {

		var report1,
			report2,
			report3;

		before(function (done) {
			report1 = new Report({userid: user._id, date: new Date('June 31, 2012')});
			report2 = new Report({userid: user._id, date: new Date('July 15, 2012')});
			report3 = new Report({userid: user._id, date: new Date('July 4, 2012')});
			report1.save(function (err) {
				if (err) {
					throw err;
				}
				report2.save(function (err) {
					if (err) {
						throw err;
					}
					report3.save(function (err) {
						if (err) {
							throw err;
						}
						done();
					});
				});
			});
		});

		after(function (done) {
			report1.remove(function (err) {
				if (err) {
					throw err;
				}
				report2.remove(function (err) {
					if (err) {
						throw err;
					}
					report3.remove(function (err) {
						if (err) {
							throw err;
						}
						done();
					});
				});
			});
		});

		describe('with no additional parameters', function () {
			it('should return the most recent report', function (done) {
				request(app)
					.get('/api/reports')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.end(function (err, res) {
						should(err).not.exist;
						res.statusCode.should.be.equal(200);
						res.body.should.be.an.object;
						Array.isArray(res.body).should.be.true;
						res.body.length.should.be.equal(1);
						var date = new Date(res.body[0].date);
						date.getTime().should.be.equal((new Date('July 15, 2012')).getTime());
						done();
					});
			});
		});


		describe('with a number of 2', function () {
			it('should return the 2 most recent reports', function (done) {
				request(app)
					.get('/api/reports/2')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.end(function (err, res) {
						should(err).not.exist;
						res.statusCode.should.be.equal(200);
						res.body.should.be.an.object;
						Array.isArray(res.body).should.be.true;
						res.body.length.should.be.equal(2);
						var date = new Date(res.body[0].date);
						date.getTime().should.be.equal((new Date('July 15, 2012')).getTime());
						date = new Date(res.body[1].date);
						date.getTime().should.be.equal((new Date('July 4, 2012')).getTime());
						done();
					});
			});
		});



		describe('with a skip of 1 and a number of 2', function () {
			it('should return 2 reports skipping the first', function (done) {
				request(app)
					.get('/api/reports/1/2')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.end(function (err, res) {
						should(err).not.exist;
						res.statusCode.should.be.equal(200);
						res.body.should.be.an.object;
						Array.isArray(res.body).should.be.true;
						res.body.length.should.be.equal(2);
						var date = new Date(res.body[0].date);
						date.getTime().should.be.equal((new Date('July 4, 2012')).getTime());
						date = new Date(res.body[1].date);
						date.getTime().should.be.equal((new Date('June 31, 2012')).getTime());
						done();
					});
			});
		});
	});

	describe('POST /api/reports', function () {

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
						res.body.message.should.be.equal('Bad request');
						done();
					});
			});
		});


		describe('with a valid body', function () {


			var date = new Date('December 25, 1901'),
				report = {
				date: date,
				categories: [
					{
						type: 'food',
						checked: true,
						message: 'huge christmas turkey - that\'s good right?'
					},
					{
						type: 'exercise',
						checked: false
					}
				]
			};

			it('should return a 201', function (done) {
				request(app)
					.post('/api/reports')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.send(report)
					.expect(201, done);
			});

			after(function () {
				Report.remove({date: date}, function (err) {
					if (err) {
						throw err;
					}
				});
			});
		});
	});

	describe('DELETE /api/reports/:id', function () {

		describe('with an unknown report', function () {

			it('should return a 404', function (done) {

				request(app)
					.del('/api/reports/0123456789BCDEF012345')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.expect(404, done);
			});

			it('should return an error object', function (done) {

				request(app)
					.del('/api/reports/0123456789BCDEF012345')
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.end(function (err, res) {
						should(err).not.exist;
						res.body.should.be.an.object;
						res.message.should.be.equal('Not Found');
						done();
					});
			});

		});

		describe('with a report', function () {

			var report;

			beforeEach(function (done) {
				report = new Report({ userid: user._id, date: new Date()});
				report.save(function (err) {
					if (err) {
						throw err;
					}
					done();
				});
			});

			afterEach(function (done) {
				report.remove(function (err) {
					if (err) {
						throw err;
					}
					done();
				});
			});

			it('should return a 200', function (done) {

				request(app)
					.del('/api/reports/' + report._id)
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.expect(200, done);
			});

			it('should return a success object', function (done) {

				request(app)
					.del('/api/reports/' + report._id)
					.set('3day-app', 'test')
					.auth('reportsintegration', 'cats')
					.end(function (err, res) {
						should(err).not.exist;
						res.body.should.be.an.object;
						res.message.should.be.equal('Deleted');
						done();
					});
			});


		});

	});
});
