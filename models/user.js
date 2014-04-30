/**
 * @description Model for User
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 */

'use strict';

// using mongoose ODM
var mongoose = require('mongoose'),
    // bcrypt used to store password hashes
    bcrypt = require('bcrypt'),
    // the configuration file
    config = require('../config'),
    // constants
    reasonCodes = require('../lib/constants').reasonCodes,
    // work factor for password encryption
    SALT_WORK_FACTOR = 10,
    db,
    userSchema,
    usernameValidation = /^[a-zA-Z0-9_-]{4,20}$/,
    passwordValidation = /^[^\s]{6,20}$/;

// spoof a mongoose validation error for the password validation
var passwordValidationError = new Error();
passwordValidationError.name = 'ValidationError';
passwordValidationError.errors = {
    password: {
        message: '15002'
    }
};


var userSchema = mongoose.Schema({
    // the compulsory authentication fields
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // the last updated field - defaults to January 1, 1970
    latest: {
        type: Date,
        default: new Date(0)
    },
    // list of 'friends'
    friends: [mongoose.Schema.Types.ObjectId],
    // default created / updated
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

/**
 * Compares a password
 *
 * @param  {String}   password The candidate password
 * @param  {Function} next     Callback (err, isMatch)
 */
userSchema.methods.validatePassword = function(password, next) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) {
            return next(err);
        }
        next(null, isMatch);
    });
};

/**
 * Sets the latest change to the user's data
 *
 * @param {Function} next Callback (err)
 */
userSchema.methods.setLatest = function(next) {

    // set the object's latest to now
    var now = Date.now();
    this.latest = now;

    // rather than write out in a full save - just update
    // the property in the document
    this.update({
        latest: now
    }, function(err, numberAffected) {
        if (err) {
            return next(err);
        }

        if (numberAffected !== 1) {
            return next(
                new Error('Unexpected number of affected records: ' +
                    numberAffected)
            );
        }
        next();
    });
};

/**
 * Returns whether a user is a friend
 *
 * @param {Srtring}  other The username of the potential friend
 * @param {Function} next  Callback (err, friend-state, friend-id)
 */
userSchema.methods.isFriend = function(other, next) {

    if (typeof other !== 'string') {
        return next(new Error('other should be a string'));
    }

    var self = this;

    // find the user
    module.exports.findOne(
        {
            username: other
        },
        {
            '_id': 1
        },

        function(err, user) {
            // error when finding user
            if (err) {
                return next(err);
            }

            // user not known at all
            if (!user) {
                return next(null, false);
            }

            // is the user in the friend index
            if (self.friends.indexOf(user._id) >= 0) {
                next(null, true, user._id);
            } else {
                next(null, false);
            }
        }
    );
};


/**
 * Add a friend by user-id
 *
 * @param {Srtring}  other The username of the new friend
 * @param {Function} next  Callback (err)
 */
userSchema.methods.addFriend = function(username, next) {

    if (typeof username !== 'string') {
        return next(new Error('username should be a string'));
    }

    console.log('addFriend');

    var self = this;

    // find the friend
    User.findOne({
            username: username
        },
        '-__v',
        function(err, user) {

            // error when finding user
            if (err) {
                return next(err);
            }

            // user not known at all
            if (!user) {
                var error = new Error('username:' + username + ' not found');
                error.name = 'NotFound';
                return next(error);
            }

            // only add the user if its not there already
            if (self.friends.indexOf(user._id) >= 0) {
                return next(null, user);
            }

            self.friends.push(user._id);
            self.save(function (err) {
                if (err) {
                    return next(err);
                }
                return next(null, user);
            });
        }
    );
};


/**
 * Delete a friend by user-id
 *
 * @param {Srtring}  other The username of the friend
 * @param {Function} next  Callback (err)
 */
userSchema.methods.deleteFriend = function (username, next) {

    if (typeof username !== 'string') {
        return next(new Error('username should be a string'));
    }

    var self = this;

    self.isFriend(username, function (err, state, id) {
        if (err) {
            return next(err);
        }

        if (id) {
            var index = self.friends.indexOf(id);
            self.friends.splice(index, 1);
            self.save(function(err) {
                if (err) {
                    return next(err);
                }
                next();
            });
        } else {
            var error = new Error('username: ' + username + ' not a friend');
            error.name = 'NotFound';
            return next(error);
        }
    });
};

/**
 * Validation Methods
 */

// Ensure username is adequate length and characters
userSchema.path('username').validate(function(value) {
    return usernameValidation.test(value);
}, reasonCodes.USERNAME_INVALID.toString());


// connect to the database
mongoose.connect(config.database);
db = mongoose.connection;

// register function to run on save to process the password
userSchema.pre('save', function(next) {
    var user = this;

    // refresh the updated property
    user.updated = Date.now();

    if (!user.isModified('password')) {
        return next();
    }

    // validation has to happen here
    if (!passwordValidation.test(user.password)) {
        return next(passwordValidationError);
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

db.on('error', function(err) {
    // @todo something more elegant than log to console
    console.log(err);
});

// we are exporting the mongoose model
var User = mongoose.model('User', userSchema);
module.exports = User;
