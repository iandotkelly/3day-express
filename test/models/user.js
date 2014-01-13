/**
 * @description tests for users model
 */

'use strict';

var User = require('../../models').User,
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
			var user = new User({ password: 'catsss' });
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

	describe('#save() with an invalid username', function () {

		it('should return an error', function (done) {
			var user = new User(
				{
					username: 'hi',
					password: 'ThisIsAGoodOne3!'
				}
			);
			user.save(function (err) {
				err.should.be.an.object;
				err.name.should.be.equal('ValidationError');
				err.errors.username.message.should.be.equal('15001');
				done();
			});
		});
	});


	describe('#save() with an invalid password', function () {

		it('should return an error', function (done) {
			var user = new User(
				{
					username: 'iandotkelly',
					password: '   '
				}
			);
			user.save(function (err) {
				err.should.be.an.object;
				err.name.should.be.equal('ValidationError');
				err.errors.password.message.should.be.equal('15002');
				done();
			});
		});
	});

	describe('with good required parameters', function () {

		var user;

		before(function (done) {
			User.remove({username: 'testname'}, function (err) {
				if (err) {
					throw err;
				}
				user = new User(
					{
						username: 'testname',
						password: 'catsss',
					}
				);
				done();
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

		describe('#save', function () {

			it('should not have an error', function (done) {
				user.save(function (err) {
					should(err).not.Error;
					done();
				});
			});

			it('should have all the properties', function () {
				user.username.should.be.equal('testname');
				user.latest.getTime().should.be.equal(0);
			});

		});

		describe('#validatePassword()', function () {

			it('should not match with the wrong password', function (done) {
				user.validatePassword('dogsss', function (err, isMatch) {
					should(err).not.Error;
					isMatch.should.be.false;
					done();
				});
			});

			it('should match with the correct password', function (done) {
				user.validatePassword('catsss', function (err, isMatch) {
					should(err).not.Error;
					isMatch.should.be.true;
					done();
				});
			});

		});

		describe('#update()', function () {

			it('should change the latest time to something like now', function (done) {

				var diff = Math.abs(Date.now() - user.latest.getTime());
				diff.should.be.greaterThan(100000);

				user.setLatest(function (err) {
					should(err).not.exist;
					diff = Math.abs(Date.now() - user.latest.getTime());
					diff.should.be.lessThan(100);
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
			User.remove({username: 'iandotkelly'}, function (err) {
				if (err) {
					throw err;
				}
				madeUser.save(function (err) {
					if (err) {
						throw err;
					}
					done();
				});
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
			User.findOne({username: 'cats'}, function (err, user) {
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
