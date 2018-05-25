///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Prototypes ///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This prototype method determines whether or not the current value contains valid JSON
 * @name String.isJson()
 * @returns {Array|Boolean|Object}
 */
String.prototype.isJson = function () {
	// Try to parse the JSON
	try {
		// Parse the JSON
		let $json = JSON.parse(this);
		// We're done, this is JSON
		return $json;
	} catch ($error) {
		// We're done, this is not JSON
		return false;
	}
};

/**
 * This method determines whether or not the current value contains XML
 * @name String.isXml()
 * @returns {Boolean}
 */
String.prototype.isXml = function() {
	// Run the test and return
	if (this.match(/^<\?xml.*?\?>/) ? true : false);
};

/**
 * This prototype method mimics PHP's substr_replace()
 * @name String.substrReplace()
 * @param {String} $replacement
 * @param {Number, optional} $start
 * @param {Number, optional} $length
 * @returns {String}
 */
String.prototype.substrReplace = function ($replacement, $start, $length) {
	// Check the start position
	if ($start < 0) {
		// Reset the start position
		$start = ($start + this.length);
	}
	// Normalize the length
	$length = ((typeof $length !== 'undefined') ? $length : this.length);
	// Check the length
	if ($length < 0) {
		// Reset the length
		$length = ($length + this.length - $start);
	}
	// Return the replacement
	return [
		this.slice(0, $start),
		$replacement.substr(0, $length),
		$replacement.slice($length),
		this.slice($start + $length)
	].join('');
};

/**
 * This prototype method capitalizes the first letter of a string and lower-cases the rest
 * @name String.ucfirst()
 * @returns {String}
 */
String.prototype.ucfirst = function () {
	// Return the modified string
	return (this.charAt(0).toUpperCase() + this.slice(1));
}

/**
 * This prototype method capitalizes the last letter of a string and lower-cases the rest
 * @name String.uclast()
 * @returns {String}
 */
String.prototype.uclast = function () {
	// Define the character index
	var $index = (this.length - 1);
	// Return the modified string
	return (this.slice(0, ($index - 1)).toLowerCase() + this.charAt($index).toUpperCase());
}
