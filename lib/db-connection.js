
/**
 * A shared mongoose db connection
 *
 * Copyright (C) Ian Kelly
 */

'use strict';

var mongoose = require('mongoose');

// the configuration file
var config = require('../config');

// connect to the database
mongoose.connect(config.database);

// export the connection directly
module.exports = mongoose.connection;

// TODO: something slightly better than this?!?
mongoose.connection.on('error', function (err) {
    console.log(err);
});
