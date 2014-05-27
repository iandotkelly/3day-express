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

// Constants
//
var MULTIPART_HEADER = 'multipart/form-data;';

// assign mongoose's mongodb driver to Grid
grid.mongo = mongoose.mongo;

// creaete connection
var connection = mongoose.createConnection(config.database);
connection.once('open', function() {
	gfs = grid(connection.db);
});


/**
 * Completes an upload operation
 *
 * The upload comes in two parts - the image and the metadata
 * These trigger two different async events:
 *
 * - The image streaming
 * - The report retrieval
 *
 * This method is only run when both of these events are completed,
 * and updates the report with the image ID, then returns the
 * response.
 *
 * @param  {Object}   uploadState Records state of the upload
 * @param  {Response} res         The response object
 * @param  {Function} next        The callback to be used when an error occurs
 */
function completeUpload(uploadState, res, next) {

	// ugly attempt to remove the file several seconds
	// after we discover a problem - only way I could
	// find of doing this
	function deleteFileEventually(id) {
		setTimeout(function() {
			// remove with an empty callback as
			// to be honest, we don't care, this
			// an exception, and can be cleaned up later if
			// needed
			gfs.remove({
				_id: id
			}, function() {});
		}, 3000);

	}

	// if no file was found - writestream will be falsy
	// we can return at this point with an error response
	if (!uploadState.writeStream) {
		return res.json(httpStatus.BAD_REQUEST, {
			status: 'failed',
			reason: reasonCodes.NO_IMAGE_FOUND,
			message: 'No image found'
		});
	}

	// if there was never a report id found
	if (!uploadState.reportId) {
		deleteFileEventually(uploadState.gridfsFileId);
		// we didn't even get a report id
		return res.json(httpStatus.BAD_REQUEST, {
			status: 'failed',
			reason: reasonCodes.MISSING_REPORT_ID,
			message: 'No report ID'
		});
	}

	// if no report was found
	if (!uploadState.report) {
		deleteFileEventually(uploadState.gridfsFileId);
		// didn't find a report
		return res.json(httpStatus.BAD_REQUEST, {
			status: 'failed',
			reason: reasonCodes.REPORT_NOT_FOUND,
			message: 'Report not found'
		});
	}

	// update the report with the file ID and description
	uploadState.report.images.push({
		id: uploadState.gridfsFileId,
		description: uploadState.description
	});

	// save the report
	uploadState.report.save(function(err) {
		if (err) {
			return next(err);
		}
		// we're done
		res.json(httpStatus.OK, {
			status: 'ok',
			id: uploadState.gridfsFileId
		});
	});

}

/**
 * REST API
 *
 * PUT /api/image - upload a new image
 */
function create(req, res, next) {

	var contentType = req.headers['content-type'];

	// this request *must* be a multipart form - if we don't
	// reject this, the busboy will time out
	if (!contentType || contentType.indexOf(MULTIPART_HEADER) !== 0) {
		return res.json(httpStatus.BAD_REQUEST, {
			status: 'failed',
			reason: reasonCodes.NOT_MULTIPART,
			message: 'Not a multipart request'
		});
	}

	// this object will store all state information
	// through the upload process
	var uploadState = {
		gridfsFileId: null,
		writeStream: null,
		reportId: null,
		description: null,
		report: null
	};

	var reportRetrievalOngoing = false;
	var requestProcessingComplete = false;

	// use busboy to parse the request
	var busboy = new Busboy({
		headers: req.headers
	});

	// Stream the file
	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

		var config = {
			mode: 'w',
			metadata: {
				user: req.user._id
			}
		};

		config['content_type'] = mimetype;

		// stream the file to mongodb
		uploadState.writeStream = gfs.createWriteStream(config);

		uploadState.gridfsFileId = uploadState.writeStream.id;

		file.pipe(uploadState.writeStream);
	});

	// Process non file field
	busboy.on('field', function(key, value) {

		// record that a non-file field was detected
		uploadState.fieldDetected = true;

		// the field must have a metadata key
		if (key !== 'metadata') {
			return;
		}

		// need to parse the string
		try {
			value = JSON.parse(value);
		} catch (err) {
			return;
		}

		// the value must include a report id string
		if (typeof value.reportid !== 'string') {
			return;
		}

		// record we got the report id
		uploadState.reportId = value.reportid;

		// record any description (optional)
		uploadState.description = value.description;

		// retrieve the report
		reportRetrievalOngoing = true;
		Report.findOne({
				_id: value.reportid,
				userid: req.user._id
			},
			function(err, foundReport) {
				if (err) {
					return next(err);
				}
				// ok the report retrieval has
				// completed for better or worse
				reportRetrievalOngoing = false;
				uploadState.report = foundReport;

				// if this callback occurs last, we
				// should call the completeUpload method
				// to finish off
				if (requestProcessingComplete) {
					return completeUpload(uploadState, res, next);
				}
			});
	});

	// Process end of request
	busboy.on('finish', function() {

		// record the request processing has been
		// completed
		requestProcessingComplete = true;

		if (!reportRetrievalOngoing) {
			return completeUpload(uploadState, res, next);
		}
	});

	// pipe the request into busboy
	req.pipe(busboy);
}

/**
 * Retrieve an image
 *
 * GET /api/image/:id - retrieve an image with id
 */
function retrieve(req, res, next) {

	var user = req.user;
	var id;

	// try to parse the ID, as we only accept mongo object IDs
	try {
		id = mongoose.Types.ObjectId(req.params.id);
	} catch (err) {
		return res.json(httpStatus.BAD_REQUEST, {
			status: 'failed',
			reasonCode: reasonCodes.BAD_ID,
			message: 'Bad Request'
		});
	}

	// find the file
	gfs.files.findOne({
		_id: id
	}, function(err, file) {
		if (err) {
			return next(err);
		}

		// if no file - then 404
		if (!file) {
			return res.json(httpStatus.NOT_FOUND, {
				status: 'failed',
				message: 'Not found'
			});
		}

		// if unauthorized
		user.isAuthorized(file.metadata.user, function(err, authorized) {
			if (!authorized) {
				return res.json(httpStatus.UNAUTHORIZED, {
					status: 'failed',
					message: 'Unauthorized'
				});
			}
			// ok - we can stream this file
			res.setHeader('content-type', file.contentType);
			gfs.createReadStream({
				_id: id
			}).pipe(res);
		});
	});
}

/**
 * Delete an image
 *
 * DELETE /api/image/:id - delete an image with id
 */
function remove(req, res, next) {

	var user = req.user;

	// ensure the user owns the file
	gfs.files.findOne({
		_id: req.param.id
	}, function(err, file) {
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

		// need to also remove from the report
	});

	gfs.remove({
		_id: req.params.id
	}, function(err) {
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
