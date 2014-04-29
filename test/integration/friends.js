/**
 * @description Test for the /api/friends API
 */

'use strict';

var request = require('supertest');
require('should');

var app = require('../../app.js'); // this starts the server
var User = require('../../models').User;

describe('The friends API', function () {

    var user, friend1, friend2;

    before(function (done) {
        // remove any existing users of the same name
        User.remove({username: 'friend1'}, function (err) {
            if (err) {
                throw err;
            }
            User.remove({username: 'friend2'}, function (err) {
                if (err) {
                    throw err;
                }
                User.remove({username: 'friendintegration'}, function (err) {
                    if (err) {
                        throw err;
                    }
                    // add users
                    user = new User({username: 'friendintegration', password: 'catsss'});
                    friend1 = new User({username: 'friend1', password: 'catsss'});
                    friend2 = new User({username: 'friend2', password: 'catsss'});
                    user.friends.push(friend1);
                    user.friends.push(friend2);
                    user.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        friend1.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            friend2.save(function (err) {
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
    });

    after(function (done) {
        // delete the user
        user.remove(function (err) {
            if (err) {
                throw err;
            }
            friend1.remove(function (err) {
                if (err) {
                    throw err;
                }
                friend2.remove(function (err) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
            });
        });
    });

    describe('GET /api/friends', function () {

        describe('for a user without friends', function () {

            it('should return a 200', function (done) {
                request(app)
                    .get('/api/friends')
                    .set('3day-app', 'test')
                    .auth('friend1', 'catsss')
                    .expect(200, done);
            });

            it('should return an empty array', function (done) {
                request(app)
                    .get('/api/friends')
                    .set('3day-app', 'test')
                    .auth('friend1', 'catsss')
                    .end(function (err, res) {
                        res.body.should.be.an.array;
                        res.body.length.should.equal(0);
                        done();
                    });
            });

        });


        describe('for a user with friends', function () {

            it('should return a 200', function (done) {
                request(app)
                    .get('/api/friends')
                    .set('3day-app', 'test')
                    .auth('friendintegration', 'catsss')
                    .expect(200, done);
            });

            it('should return the users in an array', function (done) {

                request(app)
                    .get('/api/friends')
                    .set('3day-app', 'test')
                    .auth('friendintegration', 'catsss')
                    .end(function (err, res) {
                        res.body.should.be.an.array;
                        res.body.length.should.be.equal(2);
                        res.body[0].username.should.be.equal('friend1');
                        res.body[1].username.should.be.equal('friend2');
                        done();
                    });

            });

        });

    });

});
