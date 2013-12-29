/**
 * @description tests for users model
 */

'use strict';

var User = require('../../models/user'),
	should = require('should');

describe('User', function () {

	it('should be a function', function () {
		User.should.be.a.function;
	});

	it('should construct an object', function () {
		var user = new User({ username: 'testname' });
		user.should.be.an.object;
		user.username.should.be.equal('testname');
		user._id.should.be.a.string;
	});

	describe('#save() with missing username', function () {

		it('should return an error', function (done) {
			var user = new User({ password: 'cats' });
			user.save(function (err) {
				err.should.be.an.object;
				err.name.should.be.equal('ValidationError');
				done();
			});
		});

	});

	describe('#save() with missing password', function () {

		it('should return an error', function (done) {
			var user = new User(
				{
					username: 'testname',
				}
			);
			user.save(function (err) {
				err.should.be.an.object;
				err.name.should.be.equal('ValidationError');
				done();
			});
		});
	});

	describe('with good required parameters', function () {

		var user;

		before(function () {
			user = new User(
				{
					username: 'testname',
					password: 'cats',
				}
			);
		});

		after(function () {
			user.remove(function (err) {
				if (err) {
					throw err;
				}
			});
		});

		describe('#save', function () {

			it('should not have an error', function (done) {
				user.save(function (err) {
					should(err).not.Error;
					done();
				});
			});

			it('should have all the properties', function () {
				user.username.should.be.equal('testname');
			});

		});

		describe('#validatePassword()', function () {

			it('should not match with the wrong password', function (done) {
				user.validatePassword('dogs', function (err, isMatch) {
					should(err).not.Error;
					isMatch.should.be.false;
					done();
				});
			});

			it('should match with the correct password', function (done) {
				user.validatePassword('cats', function (err, isMatch) {
					should(err).not.Error;
					isMatch.should.be.true;
					done();
				});
			});

		});

	});

	describe('#findOne', function () {

		var madeUser;

		before(function (done) {
			madeUser = new User(
				{
					username: 'iandotkelly',
					password: 'genius'
				}
			);
			madeUser.save(function (err) {
				if (err) {
					throw err;
				}
				done();
			});
		});

		after(function () {
			madeUser.remove(function (err) {
				if (err) {
					throw err;
				}
			});
		});

		it('should not find a record with an unknown username', function (done) {
			User.findOne({email: 'cats'}, function (err, user) {
				should(err).not.Error;
				should(user).not.ok;
				done();
			});
		});

		it('should retrieve a user with a known username', function (done) {
			User.findOne({username: 'iandotkelly'}, function (err, user) {
				should(err).not.Error;
				user.should.be.a.object;
				user.username.should.equal('iandotkelly');
				done();
			});
		});

	});

});