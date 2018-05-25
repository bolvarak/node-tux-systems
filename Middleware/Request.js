///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $lodash = require('lodash'); /// The Lodash Utility Module /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $config = require('../Common/Configuration'); /// Configuration Module /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($httpRequest, $httpResponse, $nextCall) => { /// Request Module Definition /////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Processors ///////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This function processes an array variable from the POST or GET request
	 * @name processArray()
	 * @param {Array<any>} $array
	 * @returns {void}
	 */
	const processArray = ($array) => {
		// Iterate over the array
		$array.each(($value, $index) => {
			// Process and reset the value
			$array[$index] = processValue($value);
		});
		// We're done, return the array
		return $array;
	};

	/**
	 * This method processes an object variable from the POST or GET request
	 * @name processObject()
	 * @param {Object.<string, any>} $object
	 * @returns {void}
	 */
	const processObject = ($object) => {
		// Localize the keys
		let $keys = Object.keys($object);
		// Iterate over the keys
		$keys.each(($key, $index) => {
			// Add the new key
			$object[$key.toLowerCase().replace(/[^a-z0-9\$@]+/gi, '')] = processValue($object[$key]);
			// Check the key
			if ($key !== $key.toLocaleLowerCase().replace(/[^a-z0-9\$@]+/gi, '')) {
				// Remove the original key from the object
				delete $object[$key];
			}
		});
		// We're done, return the object
		return $object;
	};

	/**
	 * Thi method processes a scalar variable from the POST or GET request
	 * @name processScalar()
	 * @param {boolean|null|number|string} $scalar
	 * @returns {any}
	 * @uses processValue()
	 */
	const processScalar = ($scalar) => {
		// Define our boolean values
		let $booleans = [
			'0', '1',
			'true', 'false',
//			'yes', 'no',
			'y', 'n',
			'on', 'off'
		];
		// Define our truth values
		let $truth = [
			'1',
			'true',
//			'yes',
			'y',
			'on'
		];
		// Check the variable
		if ($lodash.isString($scalar)) {
			// Try to parse JSON
			let $json = $scalar.isJson();
			// Check the data in $scalar
			if ($json !== false) {
				// We're done, process the array
				return processValue($json);
/**
			} else if ($scalar.isXml()) {
				// We're done, process the XML
				return processXml($scalar);
 */
			} else if ($booleans.has($scalar.toLowerCase())) {
				// We're done, reset and return the value
				return ($truth.has($scalar.toLowerCase()) ? true : false);
			} else if ($scalar.match(/^[0-9]+$/)) {
				// We're done, reset and return the value
				return parseInt($scalar);
			} else if ($scalar.match(/^[0-9]+\.[0-9]+$/)) {
				// We're done, reset and return the value
				return parseFloat($scalar);
			} else {
				// We're done, return the value
				return $scalar;
			}
		} else if (!$lodash.isNumber($scalar) && !$lodash.isBoolean($scalar) && ($lodash.isEmpty($scalar) || $lodash.isNull($scalar) || $lodash.isUndefined($scalar))) {
			// We're done, return the value
			return null;
		} else {
			// We're done, return the value
			return $scalar;
		}
	};

	/**
	 * This method processes a value from the POST or GET request
	 * @name processValue()
	 * @param {any} $value
	 * @returns {any}
	 * @uses processArray()
	 * @uses processObject()
	 * @uses processScalar()
	 */
	const processValue = ($value) => {
		// Check for a scalar variable
		if ($lodash.isArray($value)) {
			// We're done, process the array
			return processArray($value);
		} else if ($lodash.isObject($value)) {
			// We're done, process the object
			return processObject($value);
		} else {
			// We're done, process the scalar
			return processScalar($value);
		}
	};


	/**
	 * This function recurses a request object from a short-hand string
	 * @name processValueSearch()
	 * @param {string} $name
	 */
	let processValueSearch = ($name) => {
		// Localize the data
		let $data = $lodash.clone($httpRequest.mValues);
		// Split the parts
		let $parts = $name.split('.');
		// Iterate over the parts
		for (let $part = 0; $part < $parts.length; ++$part) {
			// Check to see if the value exists
			if ($lodash.has($data, $parts[$part].toLowerCase().replace(/[^a-z0-9\$@]+/gi, ''))) {
				// Reset the data
				$data = $data[$parts[$part].toLowerCase().replace(/[^a-z0-9\$@]+/gi, '')];
			} else {
				// We're done
				return undefined;
			}
		}
		// We're done, return the data
		return $data;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Response Format Determinant //////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Localize our URI
	let $requestUri = $httpRequest.url.split(/\?/);
	// Grab the matches
	let $matches = $requestUri[0].match(/(\/|\.)(css|htm|html|njs|xhtml|dhtml|js|json|jsonp||pdf|php|phtm|phtml|text|txt|xml)$/i);
	// Determine the format
	if ($matches) {
		// Set the response format
		$httpResponse.returnFormat($matches[2]);
		// Reset the URL
		$httpRequest.url = $requestUri[0].substrReplace('', ($matches[0].length * -1), $matches[0].length);
		// Check the first match
		if ($matches[1] === '/') {
			// Append the character to the request URL
			$httpRequest.url += '/';
		}
	} else if ($httpRequest.normalized && $httpRequest.normalized.returnFormat) {
		// Set the response format
		$httpResponse.returnFormat($httpRequest.normalized.returnFormat);
	} else {
		// Set the default return format
		$httpResponse.returnFormat($config.system.http.defaultFormat);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Custom Request Properties ////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This property contains the case-normalized request values from GET and POST
	 * @name Express.Request.mValues
	 * @type {Object.<String, *>}
	 */
	$httpRequest.mValues = processValue($lodash.assignIn({}, $httpRequest.query, $httpRequest.headers, $httpRequest.body, $httpRequest.params));

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Custom Request Methods ///////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method ensures that a value exists in the request
	 * @name Express.Request.expect()
	 * @param {string} $name
	 * @param {*, optional} $defaultValue
	 * @returns {*}
	 */
	$httpRequest.expect = function ($name, $defaultValue) {
		// Convert the parameter
		let $parameter = processValueSearch($name);
		// Check the value
		if (($parameter === undefined) && $lodash.isUndefined($defaultValue)) {
			// Define our new error
			return this.raise(('expect() could not find the ' + $name + ' parameter in the request.'), 400);
		} else if (($parameter === undefined) && !$lodash.isUndefined($defaultValue)) {
			// Reset the value
			return this.value($name, $defaultValue);
		} else {
			// We're done, return the value
			return $parameter;
		}
	};

	/**
	 * This method creates and raises an error and kills the request
	 * @name Express.Request.raise()
	 * @param {string} $message
	 * @param {number, optional} $status
	 * @returns {void}
	 * @uses Express.Request.raiseError()
	 */
	$httpRequest.raise = function ($message, $status) {
		// Define our new error
		let $error = new Error($message);
		// Set the status into the error
		$error.status = ($lodash.isNumber($status) ? $status : 500);
		// Send the response
		this.raiseError($error);
	};

	/**
	 * This method raises an error and kills the request
	 * @name Express.Request.raiseError
	 * @param {Error} $error
	 * @param {number, optional} $status
	 * @returns {void}
	 * @uses Express.Response.value()
	 * @uses Express.Response.template()
	 * @uses Express.Response.respond()
	 */
	$httpRequest.raiseError = function ($error, $status) {
		// Reset the error status
		$error.status = ($error.status || $status || 500);
		// Set the message into the response
		$httpResponse.value('error', $error.message);
		// Check the debug flag
		if ($config.system.showDebug) {
			// Set the error into the response
			$httpResponse.value('debug', $error);
		}
		// Set the template name
		$httpResponse.template('Error');
		// Send the response
		$httpResponse.respond($error.status);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Custom Inline Methods ////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method returns a value from the request object payload with the ability to reset it inline
	 * @name Express.Request.value()
	 * @param {string} $name
	 * @param {*, optional} $value
	 * @returns {*}
	 */
	$httpRequest.value = function ($name, $value = undefined) {
		// Check for a provided value
		if (!$lodash.isUndefined($value)) {
			// Reset the value into the response object
			this.mValues[$name.toLowerCase().replace(/[^a-z0-9\$@]+/gi, '')] = $value;
		}
		// Return the value from the response object
		return processValueSearch($name);
	};

	/**
	 * This method returns the request object payload with the ability to reset it inline
	 * @name Express.Request.values()
	 * @param {Object.<String, *>, optional} $object
	 * @returns {Object.<String, *>}
	 */
	$httpRequest.values = function ($object) {
		// Check for a provided values payload
		if ($lodash.isObject($object)) {
			// Reset the values into the response object
			this.mValues = $object;
		}
		// Return the values payload from the response object
		return this.mValues;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$nextCall(); /// Execute the next call in the stack //////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End Request Module Definition /////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

