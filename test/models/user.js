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


  describe('#isFriend', function() {

    var myuser, friend, notFriend;

    before(function (done) {

      friend = new User({
        username: 'friend',
        password: 'othergenius'
      });
      myuser = new User({
          username: 'iandotkelly',
          password: 'genius',
          friends: [
            friend._id
          ]
      });
      notFriend = new User({
        username: 'notfriend',
        password: 'thirdgenius'
      });

      User.remove({username: 'iandotkelly'}, function (err) {
        if (err) {
          throw err;
        }
        User.remove({username: 'friend'}, function (err) {
          if (err) {
            throw err;
          }
          User.remove({username: 'notfriend'}, function (err) {
            if (err) {
              throw err;
            }
            myuser.save(function (err) {
              if (err) {
                throw err;
              }
              friend.save(function (err) {
                if (err) {
                  throw err;
                }
                notFriend.save(function (err) {
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

    after(function () {
      myuser.remove(function (err) {
        if (err) {
          throw err;
        }
        friend.remove(function (err) {
          if (err) {
            throw err;
          }
          notFriend.remove(function (err) {
            if (err) {
              throw err;
            }
          });
        });
      });
    });

    it('with a non string, it should return an error', function (done) {
      myuser.isFriend(1, function (err, state, id) {
        should(err).error;
        should(state).be.undefined;
        should(id).be.undefined;
        done();
      });
    });

    it('with an unknown username it should return false', function (done) {
      myuser.isFriend('rubbish', function (err, state, id) {
        should(err).not.error;
        state.should.be.false;
        should(id).be.undefined;
        done();
      });
    });

    it('with the non friend should return false', function (done) {
      myuser.isFriend('notfriend', function (err, state, id) {
        should(err).not.error;
        state.should.be.false;
        should(id).be.undefined;
        done();
      });
    });

    it('with the friend should return true', function (done) {
      myuser.isFriend('friend', function (err, state, id) {
        should(err).not.error;
        state.should.be.true;
        should(id.toString()).be.equal(friend._id.toString());
        done();
      });
    });

  });


  describe('#addFriend', function() {

    var myuser, friend;

    before(function (done) {

      friend = new User({
        username: 'friend',
        password: 'othergenius'
      });
      myuser = new User({
          username: 'iandotkelly',
          password: 'genius'
      });

      User.remove({username: 'iandotkelly'}, function (err) {
        if (err) {
          throw err;
        }
        User.remove({username: 'friend'}, function (err) {
          if (err) {
            throw err;
          }

          myuser.save(function (err) {
            if (err) {
              throw err;
            }
            friend.save(function (err) {
              if (err) {
                throw err;
              }
              done();
            });
          });
        });
      });
    });

    after(function () {
      myuser.remove(function (err) {
        if (err) {
          throw err;
        }
        friend.remove(function (err) {
          if (err) {
            throw err;
          }
        });
      });
    });

    it('should return an error if the user id is not known', function (done) {
      myuser.addFriend('nonsense', function(err) {
        should(err).be.an.object;
        done();
      });
    });

    it('should add a valid new user', function (done) {
      myuser.friends.length.should.be.equal(0);
      myuser.addFriend('friend', function (err) {
        should(err).not.be.an.object;
        User.findOne({
          username: 'iandotkelly'
        }, function (err, user) {
          should(err).not.be.an.object;
          user.friends.length.should.be.equal(1);
          user.friends[0].toString().should.be.equal(friend._id.toString());
          done();
        });
      });
    });
  });



  describe('#deleteFriend', function() {

    var myuser, friend;

    before(function (done) {

      friend = new User({
        username: 'friend',
        password: 'othergenius'
      });
      myuser = new User({
          username: 'iandotkelly',
          password: 'genius',
          friends: [
            friend._id
          ]
      });

      User.remove({username: 'iandotkelly'}, function (err) {
        if (err) {
          throw err;
        }
        User.remove({username: 'friend'}, function (err) {
          if (err) {
            throw err;
          }
          myuser.save(function (err) {
            if (err) {
              throw err;
            }
            friend.save(function (err) {
              if (err) {
                throw err;
              }
              done();
            });
          });
        });
      });
    });

    after(function () {
      myuser.remove(function (err) {
        if (err) {
          throw err;
        }
        friend.remove(function (err) {
          if (err) {
            throw err;
          }
        });
      });
    });

    it('should return an error if the username is not known', function (done) {
      myuser.deleteFriend('nonsense', function(err) {
        should(err).be.an.object;
        User.findOne({
          username: 'iandotkelly'
        }, function (err, user) {
          should(err).not.be.an.object;
          user.friends.length.should.be.equal(1);
        });
        done();
      });
    });

    it('should delete the friend', function (done) {
      myuser.deleteFriend('friend', function (err) {
        should(err).not.be.an.object;
        User.findOne({
          username: 'iandotkelly'
        }, function (err, user) {
          should(err).not.be.an.object;
          user.friends.length.should.be.equal(0);
          done();
        });
      });
    });
  });



});
