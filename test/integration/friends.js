/**
 * @description Test for the /api/friends API
 */

'use strict';

var request = require('supertest');
var should = require('should');

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
                        should(err).be.not.an.object;
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
                        should(err).be.not.an.object;
                        res.body.should.be.an.array;
                        res.body.length.should.be.equal(1);
                        res.body[0].username.should.be.equal('friend1');
                        done();
                    });

            });

        });


        describe('POST /api/friends/:username', function () {

            describe('with no user', function () {

                it('should return a 404', function (done) {
                    request(app)
                        .post('/api/friends')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .expect(404, done);
                });

            });

            describe('for an unknown user', function () {

                it('should return a 404', function (done) {
                    request(app)
                        .post('/api/friends/nonsense')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .expect(404, done);
                });

                it('should return an error response', function (done) {
                    request(app)
                        .post('/api/friends/nonsense')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .end(function (err, res) {
                            should(err).be.not.an.object;
                            res.body.should.be.an.object;
                            res.body.status.should.be.equal('failed');
                            done();
                        });
                });
            });

            describe('for an known user', function () {

                it('should return a 200', function (done) {
                    request(app)
                        .post('/api/friends/friend2')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .expect(200, done);
                });

                it('should return an success response with the id', function (done) {
                    request(app)
                        .post('/api/friends/friend2')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .end(function (err, res) {
                            should(err).be.not.an.object;
                            res.body.should.be.an.object;
                            res.body.status.should.be.equal('success');
                            res.body.id.should.be.equal(friend2._id.toString());
                            done();
                        });
                });

                it('should now have the friend added', function (done) {
                    User.findOne({
                        username: 'friendintegration'
                    }, function (err, user) {
                        user.friends.should.be.an.array;
                        user.friends.length.should.be.equal(2);
                        user.friends[0].toString().should.be.equal(friend1._id.toString());
                        user.friends[1].toString().should.be.equal(friend2._id.toString());
                        done();
                    });
                });
            });
        });

        describe('DELETE /api/friends/:username', function () {

            describe('with no user', function () {

                it('should return a 404', function (done) {
                    request(app)
                        .del('/api/friends')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .expect(404, done);
                });
            });

            describe('for an unknown user', function () {

                it('should return a 404', function (done) {
                    request(app)
                        .del('/api/friends/nonsense')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .expect(404, done);
                });

                it('should return an error response', function (done) {
                    request(app)
                        .del('/api/friends/nonsense')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .end(function (err, res) {
                            should(err).be.not.an.object;
                            res.body.should.be.an.object;
                            res.body.status.should.be.equal('failed');
                            done();
                        });
                });
            });

            describe('for an known user', function () {

                it('should return an success response', function (done) {
                    request(app)
                        .del('/api/friends/friend1')
                        .set('3day-app', 'test')
                        .auth('friendintegration', 'catsss')
                        .end(function (err, res) {
                            should(err).be.not.an.object;
                            res.status.should.be.equal(200);
                            res.body.should.be.an.object;
                            res.body.status.should.be.equal('success');
                            done();
                        });
                });

                it('should now have the friend1 removed', function (done) {
                    User.findOne({
                        username: 'friendintegration'
                    }, function (err, user) {
                        user.friends.should.be.an.array;
                        user.friends.length.should.be.equal(1);
                        user.friends[0].toString().should.be.equal(friend2._id.toString());
                        done();
                    });
                });
            });
        });
    });

});
