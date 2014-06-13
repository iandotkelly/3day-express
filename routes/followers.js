/**
 * @description Route to handle operations on the /followers resource
 *
 * @copyright Copyright (c) Ian Kelly
 */

'use strict';

var httpStatus = require('http-status');
var ObjectId = require('mongoose').Types.ObjectId;
var User = require('../models/user');

/**
 * Retrieve a list of all the followers of a user
 */
function retrieve(req, res, next) {

  var followers = req.user.toObject().followers || [];

  var active = [];

  // only copy active users
  for (var index = 0, len = followers.length; index < len; index++) {
    var follower = followers[index];

    if (follower.status.active) {
      active.push({
        id: follower.id,
        status: {
          approved: follower.approved,
          blocked: follower.blocked
        }
      });
    }
  }

  // add usernames
  User.addUsername(active, function(err) {
    if (err) {
      return next(err);
    }

    return res.json(httpStatus.OK, active);
  });
}

/**
 * Update a particular followers details
 */
function update(req, res, next) {
  /* jshint maxstatements: 21 */

  var id = req.params.id;
  var followers = req.user.followers;
  var approved = req.body.approved;
  var blocked = req.body.blocked;

  try {
    id = new ObjectId(id);
  } catch (err) {
    return res.json(httpStatus.BAD_REQUEST, {
      status: 'failed',
      message: 'not a user id'
    });
  }

  if (typeof approved !== 'boolean' && typeof blocked !== 'boolean') {
    return res.json(httpStatus.BAD_REQUEST, {
      status: 'failed',
      message: 'no data included'
    });
  }

  // find the relevent user
  var found;
  for (var index = 0, len = followers.length; index < len; index++) {
    var follower = followers[index];
    if (follower.id.equals(id)) {
      found = follower;
      break;
    }
  }

  if (!found) {
    return res.json(httpStatus.BAD_REQUEST, {
      status: 'failed',
      message: 'not following user ' + id.toString()
    });
  }

  if (approved !== undefined) {
    found.status.approved = approved;
  }

  if (blocked !== undefined) {
    found.status.blocked = blocked;
  }

  req.user.save(function (err) {
    if (err) {
      return next(err);
    }

    return res.json(httpStatus.OK, {
      status: 'success',
      message: 'follower status updated'
    });
  });

}

module.exports = {
  retrieve: retrieve,
  update: update
};
