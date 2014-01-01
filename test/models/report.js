/**
 * @description tests for report model
 */

'use strict';

var Report = require('../../models').Report,
	mongoose = require('mongoose'),
	should = require('should');

describe('Report', function () {

	it('should be a function', function () {
		Report.should.be.a.function;
	});

	it('should construct an object', function () {
		var report = new Report();
		report.should.be.an.object;
		report._id.should.be.a.string;
	});

	describe('#save() with no userid', function () {

		it('should return an error', function (done) {
			var report = new Report({});
			report.save(function (err) {
				err.should.be.an.object;
				err.name.should.be.equal('ValidationError');
				done();
			});
		});

	});


	describe('#save() with a userid', function () {

		var report;

		afterEach(function (done) {
			if (report) {
				report.remove(function (err) {
					if (err) {
						throw err;
					}
					done();
				});
			} else {
				done();
			}
		});

		it('should create an empty report', function (done) {
			var fakeUserId = mongoose.Types.ObjectId();

			report = new Report({userid: fakeUserId});
			report.save(function (err) {
				should(err).not.exist;
				report.__v.should.exist;
				report._id.should.exist;
				report._id.should.be.an.object;
				report.categories.should.be.an.array;
				report.date.should.be.an.object;
				done();
			});
		});
	});


	describe('find()', function () {

		var report1,
			report2,
			report3,
			fakeUserId = mongoose.Types.ObjectId();

		before(function (done) {
			report1 = new Report({userid: fakeUserId, date: new Date('June 31, 2012')});
			report2 = new Report({userid: fakeUserId, date: new Date('July 15, 2012')});
			report3 = new Report({userid: fakeUserId, date: new Date('July 4, 2012')});
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

		describe('with just a username filter', function () {

			it('should return all 3 reports', function (done) {

				Report.find({userid: fakeUserId}, function (err, reports) {
					reports.length.should.equal(3);
					done();
				});

			});

		});


		describe('with a username filter and a skip and limit of 1',
			function () {

				it('should return the middle report in db order', function (done) {

					Report.find(
						{
							userid: fakeUserId
						}, null,
						{
							skip: 1,
							limit: 1
						},
						function (err, reports) {
							reports.length.should.equal(1);
							// should return the middle report as added to mongo
							reports[0].date.getTime().should.equal((new Date('July 15, 2012')).getTime());
							done();
						});
				});

			});



		describe('with a username filter and a skip and limit of 1 and in reverse date order',
			function () {

				it('should return the middle report in date order', function (done) {

					Report.find(
						{
							userid: fakeUserId
						},
						null,
						{
							skip: 1,
							limit: 1,
							sort: {
								date: -1
							}
						},
						function (err, reports) {
							reports.length.should.equal(1);
							// should return the middle report in date order
							reports[0].date.getTime().should.equal((new Date('July 4, 2012')).getTime());
							done();
						});
				});

			});
	});


});