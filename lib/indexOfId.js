/**
 * @description	Utility to find index of object in an array, when the
 *				item has an ObjectId in the id property
 */
'use strict';

function indexOfId(array, id) {

	var index, len, item;

	if (!Array.isArray(array)) {
		throw new Error('Should only be called on an array');
	}

	for (index = 0, len = array.length; index < len; index++) {
		item = array[index];
		if (item.id && item.id.equals(id)) {
			return index;
		}
	}

	return -1;
}

module.exports = indexOfId;
