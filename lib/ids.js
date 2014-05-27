/**
 * @description	Utility to find index of object in an array, when the
 *				item has an ObjectId in the id property
 */
'use strict';

/**
 * Returns the index of the first matching ID in an array
 *
 * @param {Array} 		array The array containing objects with id
 * @param {ObjectId} 	id    The objectid
 */
function indexOfId(array, id) {

	if (!Array.isArray(array)) {
		throw new Error('Should only be called on an array');
	}

	if (id === undefined) {
		throw new Error('id must be defined');
	}

	var index, len, item;

	for (index = 0, len = array.length; index < len; index++) {
		item = array[index];
		if (item.id) {
			// we prefer the equals method if available
			if ((typeof item.id.equals === 'function' && item.id.equals(id)) || item.id === id) {
				return index;
			}
		}
	}

	return -1;
}

/**
 * Returns array of all IDs
 *
 * @param {Array} array The array of objects
 */
function listOfIds(array) {

	array = array || [];

	var ids = [], id, index, len;

	for (index = 0, len = array.length; index < len; index++) {
		id = array[index].id;
		if (id !== undefined && ids.indexOf(id) === -1) {
			ids.push(id);
		}
	}

	return ids;
}

module.exports = {
	indexOf: indexOfId,
	listOf: listOfIds
};
