/**
 * @description Route to handle operations on the /friends resource
 *
 * @copyright Copyright (c) Ian Kelly
 */

'use strict';

var httpStatus = require('http-status');
var User = require('../models').User;

/**
 * Add a friend to a user
 */
function create(req, res, next) {

    req.user.addFriend(req.params.username, function(err, user) {

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
 * Retrieve a list of all the friends of a user
 */
function retrieve(req, res, next) {

    var user = req.user;

    // find all documents - but we're only interested
    // in a couple of fields
    User.find({
        '_id': {
            $in: user.friends
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

    req.user.deleteFriend(req.params.username, function (err) {

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
