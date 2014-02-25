/**
 * @description Model for a report
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 */

'use strict';

	// using mongoose ODM
var mongoose = require('mongoose'),
	// the configuration file
	config = require('../config'),
	db,
	reportSchema;

reportSchema = mongoose.Schema({

	userid: { type: mongoose.Schema.ObjectId, required: true },
	date: { type: Date, default: Date.now },
	categories: [
		{
			type: { type: String, required: true },
			checked: { type: Boolean, default: false },
			message: { type: String }
		}
	],
	images: [
		{
			id: { type: mongoose.Schema.ObjectId, required: true },
			description: { type: String }
		}
	],
	// default created / updated
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now }

});

/**
 * Find a report by the image ID
 *
 * @param  {ObjectId}   imageId  The ObjectId of the image
 * @param  {Function}	callback Callback(err, report)
 */
reportSchema.statics.findByImageId = function (imageId, callback) {

	this.findOne({ 'images.id': imageId }, callback);

};

// connect to the database
mongoose.connect(config.database);
db = mongoose.connection;

db.on('error', function (err) {
	// @todo something more elegant than log to console
	console.log(err);
});

// we are exporting the mongoose model
module.exports = mongoose.model('Report', reportSchema);
