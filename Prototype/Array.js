///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Prototypes ///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This prototype method provides a more efficient alternative to Array.prototype.forEach()
 * @name Array.prototype.each()
 * @param {function} $callback
 * @param {Object.<any>} $scope
 * @returns {void}
 */
Array.prototype.each = function ($callback, $scope) {
	// Check for a scope
	if (typeof $scope === 'undefined') {
		// Reset the scope
		$scope = this;
	}
	// Iterate over the array
	for (let $index = 0; $index < this.length; ++$index) {
		// Execute the callback
		$callback.apply($scope, [this[$index], $index]);
	}
};

/**
 * This prototype method determines whether or not the array contains a value
 * @name Array.prototype.has()
 * @param {any} $needle
 * @returns {boolean}
 */
Array.prototype.has = function ($needle) {
	// Iterate over the values
	for (let $index = 0; $index < this.length; ++$index) {
		// Check the value against the index
		if ($needle.toLowerCase() === this[$index].toLowerCase()) {
			// We're done
			return true;
		}
	}
	// We're done
	return false;
};

/**
 * This prototype method searches the array for a string value that matches the needle with all non-alphanumeric characters and casing removed
 * @name Array.prototype.hasSimilarStringValue()
 * @param {string} $needle
 * @param {boolean, optional} $fallThrough [false]
 * @returns {string|false}
 */
Array.prototype.hasSimilarStringValue = function($needle, $fallThrough) {
	// Iterate over the indices
	for (let $index = 0; $index < this.length; ++$index) {
		// Compare the value to the needle
		if ((typeof this[$index] === 'string') && ($needle.replace(/[^a-z0-9]/gi, '').toLowerCase() === this[$index].replace(/[^a-z0-9]/gi, '').toLowerCase())) {
			// We're done, return the value
			return this[$index];
		}
	}
	// We're done, nothing found
	return ($fallThrough ? $needle : false);
};

/**
 * This prototype method sorts an Array of Objects based on a child Object's property value
 * @name Array.prototype.sortChildObjectsBy()
 * @param {string} $property
 * @param {boolean, optional} $reverse
 * @param {funciton} $primer
 * @returns {void}
 */
Array.prototype.sortChildObjectsBy = function ($property, $reverse, $primer) {
	// Define our keymod handler
	let _key = ($primer ? function ($data) {
		// Return the primed property
		return $primer($data[$property]);
	} : function ($data) {
		// Return the property
		return $data[$property];
	});
	// Check the reverse flag
	$reverse = ($reverse ? -1 : 1);
	// Sort the array
	this.sort(function ($a, $b) {
		// Return the property
		return $a = _key($a), $b = _key($b), ($reverse * (($a > $b) - ($b > $a)));
	});
};
