/**
 * Routes for the GUI
 */

'use strict';

function index(request, response) {
	response.render('index');
}

function partials(request, res) {
	var name = request.params.name;
	res.render('partials/' + name);
}

module.exports = {
	index: index,
	partials: partials,
};
