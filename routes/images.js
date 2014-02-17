/**
 * @description Image REST API
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 */

'use strict';

var Busboy = require('busboy');
var grid = require('gridfs-stream');
var mongoose = require('mongoose');
var httpStatus = require('http-status');
var reasonCodes = require('../lib/constants').reasonCodes;
var config = require('../config');
var Report = require('../models').Report;

var gfs;

// assign mongoose's mongodb driver to Grid
grid.mongo = mongoose.mongo;

// creaete connection
var connection = mongoose.createConnection(config.database);
connection.once('open', function () {
	gfs = grid(connection.db);
});

/**
 * REST API
 *
 * PUT /api/image - upload a new image
 */
function create(req, res, next) {

	// the writeable gridfs stream
	var writestream;

	// metadata
	var reportId;
	var description;

	// any retrieved report
	var report;

	// create an ID for the file
	var id = mongoose.Types.ObjectId();

	// use busboy to parse the request
	var busboy = new Busboy({
		headers: req.headers
	});

	// Stream the file
	busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

		// stream the file to mongodb
		writestream = gfs.createWriteStream({
			root: 'images',
			_id: id,
			mode: 'w',
			mimetype: mimetype,
			metadata: {
				user: req.user._id
			}
		});

		// pipe the file into the stream
		file.pipe(writestream);
	});

	// Process non file field
	busboy.on('field', function (key, value) {

		// process a metadata field
		if (key === 'metadata') {

			// need to parse the string
			try {
				value = JSON.parse(value);
			} catch (err) {
				return;
			}

			if (value.reportid) {

				// record we got the report id
				reportId = value.reportid;

				// record any description
				description = value.description;

				// retrieve the report
				Report.findOne({
					_id: value.reportid,
					userid: req.user._id
				},
				function (err, foundReport) {
					if (err) {
						return next(err);
					}

					report = foundReport;
				});
			}
		}
	});

	// Process end of request
	busboy.on('finish', function () {

		// if no file was found
		if (!writestream) {
			return res.json(httpStatus.BAD_REQUEST, {
				status: 'failed',
				reason: reasonCodes.NO_IMAGE_FOUND,
				message: 'No image found'
			});
		}

		if (!reportId) {
			// we didn't even get a report id
			return gfs.remove({_id: id}, function (err) {
				if (err) {
					return next(err);
				}
				res.json(httpStatus.BAD_REQUEST, {
					status: 'failed',
					reason: reasonCodes.MISSING_REPORT_ID,
					message: 'No report ID'
				});
			});
		}

		if (!report) {
			console.log('!Y!UH!YI!YIO!');
			// didn't find a report
			return gfs.remove({_id: id}, function (err) {
				if (err) {
					return next(err);
				}
				res.json(httpStatus.BAD_REQUEST, {
					status: 'failed',
					reason: reasonCodes.REPORT_NOT_FOUND,
					message: 'Report not found'
				});
			});
		}

		// update the report
		report.images.push({
			id: id,
			description: description
		});

		// update the report
		report.save(function (err) {
			if (err) {
				return next(err);
			}
			// we're done
			res.json(httpStatus.OK, {
				status: 'ok',
				id: id
			});
		});

	});

	// pipe the request into busboy
	return req.pipe(busboy);
}

/**
 * Retrieve an image
 *
 * GET /api/image/:id - retrieve an image with id
 */
function retrieve(req, res, next) {

	var user = req.user;

	// ensure the user owns the fole
	gfs.files.findOne({
		_id: req.param.id
	}, function (err, file) {
		if (err) {
			return next(err);
		}

		if (file.userid !== user._id) {
			// this file is not owned by the user
			return res.json(httpStatus.UNAUTHORIZED, {
				status: 'failed',
				message: 'Unauthorized'
			});
		}
	});

	return gfs.createReadStream({_id: req.param.id}).pipe(res);
}

/**
 * Delete an image
 *
 * DELETE /api/image/:id - delete an image with id
 */
function remove(req, res, next) {

	var user = req.user;

	// ensure the user owns the fole
	gfs.files.findOne({
		_id: req.param.id
	}, function (err, file) {
		if (err) {
			return next(err);
		}

		if (file.userid !== user._id) {
			// this file is not owned by the user
			return res.json(httpStatus.UNAUTHORIZED, {
				status: 'failed',
				message: 'Unauthorized'
			});
		}
	});

	gfs.remove({_id: req.params.id}, function (err) {
		if (err) {
			return next(err);
		}

		return res.json(httpStatus.OK, {
			status: 'ok'
		});
	});
}

module.exports = {
	create: create,
	retrieve: retrieve,
	remove: remove
};

