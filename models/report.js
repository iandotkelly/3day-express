/**
 * @description Model for a report
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 */

'use strict';

// db connection
var db = require('../lib/db-connection');
// using mongoose ODM
var mongoose = require('mongoose');

var reportSchema = mongoose.Schema({

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

/**
 * Remove an image
 *
 * @param  {ObjectId}   imageId  The ObjectId of the image
 * @param  {Function}	callback Callback(err, numAffected)
 */
reportSchema.statics.removeImageByImageId = function (imageId, callback) {

	this.update({
		'images.id': imageId
	},
	{
		$pull: {
			'images': { id: imageId }
		}
	},
	{
		multi: false
	},
	callback);
};

db.on('error', function (err) {
	// @todo something more elegant than log to console
	console.log(err);
});

// we are exporting the mongoose model
module.exports = mongoose.model('Report', reportSchema);
