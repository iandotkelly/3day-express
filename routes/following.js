/**
 * @description Route to handle operations on the /following resource
 *
 * @copyright Copyright (c) Ian Kelly
 */

'use strict';

var httpStatus = require('http-status');
var User = require('../models').User;

/**
 * Add a person you are following
 */
function create(req, res, next) {

    req.user.addFollowing(req.params.username, function(err, user) {

        if (err) {
            if (err.name === 'NotFound') {
                // ok - so we don't know this friend
                return res.json(httpStatus.NOT_FOUND, {
                    status: 'failed',
                    message: 'Not found'
                });
            } else {
                // true error - oops
                return next(err);
            }
        }

        // ok, we're home and dry
        res.json(httpStatus.OK, {
            status: 'success',
            message: 'friend added',
            id: user._id
        });
    });
}

/**
 * Retrieve a list of all the people a user is following
 */
function retrieve(req, res, next) {

    var user = req.user;

    // find all documents - but we're only interested
    // in a couple of fields
    User.find({
        '_id': {
            $in: user.following
        }
        }, {
            '_id': 1,
            'username': 1
        },
        function(err, docs) {
            if (err) {
                return next(err);
            }
            res.json(httpStatus.OK, docs);
        });
}

/**
 * Remove a friend
 */
function remove(req, res, next) {

    req.user.deleteFollowing(req.params.username, function (err) {
        if (err) {
            if (err.name === 'NotFollowing' || err.name === 'NotKnown') {
                // ok - so we don't know this user
                return res.json(httpStatus.NOT_FOUND, {
                    status: 'failed',
                    message: 'Not found'
                });
            } else {
                // true error - oops
                return next(err);
            }
        }

        res.json(httpStatus.OK, {
            status: 'success'
        });
    });
}

module.exports = {
    create: create,
    retrieve: retrieve,
    remove: remove
};