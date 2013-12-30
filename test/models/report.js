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
});