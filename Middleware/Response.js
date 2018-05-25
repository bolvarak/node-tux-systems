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
/// Module Dependencies //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// We need the XML library module
let $xml = require('xml2js');
// We need the ExpressJS module
let $ejs = require('ejs');
// We need the mime-types module
let $mimeTypes = require('mime-types');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($httpRequest, $httpResponse, $nextCall) => { /// Response Module Definition ////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Custom Response Properties ///////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This property contains the response content to be rendered
	 * @name Express.Response.mTemplate
	 * @type {string}
	 */
	$httpResponse.mContent = '';

	/**
	 * This property contains the response format for the request
	 * @name Express.Response.mFormat
	 * @type {string}
	 */
	$httpResponse.mFormat = 'json';

	/**
	 * This property contains local values for the response payload
	 * @name Express.Response.mValues
	 * @type {Object.<String, *>}
	 */
	$httpResponse.mValues = {};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Custom Response Methods //////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method determines the mime-type from the response format
	 * @name Express.Response.formatToMime()
	 * @returns {string}
	 */
	$httpResponse.formatToMime = function () {
		// Check for JSONP
		if (this.returnFormat() === 'jsonp') {
			// Return the type
			return 'text/javascript';
		} else if (this.returnFormat().match(/^((d|x)?html?|njs)$/)) {
			// Return the mime-type
			return 'text/html';
		} else {
			// Return the mime-type
			return ($mimeTypes.types[this.returnFormat()] || 'text/plain');
		}
	};

	/**
	 * This method sends an encoded response based on the requested response format
	 * @name Express.Response.respond()
	 * @param {number, optional} $status
	 * @returns {void}
	 */
	$httpResponse.respond = function ($status) {
		// Check for a status
		if (!$lodash.isNumber($status)) {
			// Reset the status
			$status = 200;
		}
		// Check the status
		if ($status < 400) {
			// Set the success flag into the response
			this.value('success', true);
		} else {
			// Set the template into the response
			this.template('Error');
			// Set the success flag into the response
			this.value('success', false);
		}
		// Set the HTTP status
		this.status($status);
		// Check the response format and the template
		if (this.returnFormat().match(/^((d|x)?html?|njs|css|txt|js)$/) && $lodash.isEmpty(this.content())) {
			// Set the status
			this.status(200);
			// Send the mime-type
			this.set('Content-Type', 'text/html');
			// Render the template
			return this.render('Dump', {
				'dump': require('util').inspect(this.mValues)
			});
		} else if (this.returnFormat().match(/^((d|x)?html?|njs|css|txt|js)$/) && !$lodash.isEmpty(this.template())) {
			// Send the mime-type
			this.set('Content-Type', this.formatToMime());
			// Render the template
			return this.render(this.template(), this.mValues);
		} else if (this.returnFormat().match(/^((d|x)?html?|njs|css|txt|js)$/) && $lodash.isEmpty(this.template())) {
			// Send the mime-type
			this.set('Content-Type', this.formatToMime());
			// Render and send the template
			return this.send($ejs.render(this.content(), this.mValues));
		} else if (this.returnFormat() === 'json') {
			// Send the JSON
			return this.json(this.mValues);
		} else if (this.returnFormat() === 'jsonp') {
			// Send the JSONp
			return this.jsonp(this.mValues);
		} else if (this.returnFormat() === 'xml') {
			// Send the XML
			return this.xml(this.mValues);
		} else if (!this.returnFormat().match(/^((d|x)?html?|njs|css|txt|js)$/) && !$lodash.isEmpty(this.file())) {
			// Set the mime-type
			this.set('Content-Type', this.formatToMime());
			// Send the file
			return this.sendFile(this.file());
		} else if (!this.returnFormat().match(/^((d|x)?html?|njs|css|txt|js)$/) && $lodash.isEmpty(this.file())) {
			// Set the mime-type
			this.set('Content-Type', this.formatToMime());
			// Send the file
			return this.send(this.content());
		} else {
			// Set the header
			this.set('Content-Type', 'text/plain');
			// Send the response
			return this.send(this.content());
		}
	};

	/**
	 * This method responds with XML
	 * @name Express.Response.xml()
	 * @param {Object} $data
	 * @returns {void}
	 */
	$httpResponse.xml = function ($data) {
		// Define our XML builder
		let $xmlBuilder = new $xml.Builder({
			'cdata': true,
			'headless': true,
			'renderOpts': {
				'pretty': true,
				'indent': '\t',
				'newline': '\n'
			}
		});
		// Build the object
		let $xmlPayload = $xmlBuilder.buildObject($payload);
		// Send the header
		$httpResponse.set('Content-Type', 'text/xml');
		// Send the data
		$httpResponse.send($xmlPayload);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Custom Inline Methods ////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method returns the raw content from the response object with the ability to reset it inline
	 * @name Express.Response.content()
	 * @param {string, optional} $string
	 * @returns {string}
	 */
	$httpResponse.content = function ($string) {
		// Check for a provided string
		if ($lodash.isString($string)) {
			// Reset the content into the response object
			this.mContent = $string;
		}
		// Return the content from the response object
		return this.mContent;
	};

	/**
	 * This method returns the response file from the response object with the ability to reset it inline
	 * @name Express.Response.file()
	 * @param {string, optional} $string
	 * @returns {string}
	 */
	$httpResponse.file = function ($string) {
		// Check for a provided file path
		if ($lodash.isString($string) && !$lodash.isEmpty($string)) {
			// Reset the file path into the response object
			this.content('file::' + $string);
		}
		// Return the file path from the response object
		return ((this.content().substr(0, 6) === 'file::') ? this.content().substr(6) : '');
	};

	/**
	 * This method returns the response format from the request object with the ability to reset it inline
	 * @name Express.Response.returnFormat()
	 * @param {string, optional} $string
	 * @returns {string}
	 */
	$httpResponse.returnFormat = function ($string) {
		// Check for a provided format
		if ($lodash.isString($string) && !$lodash.isEmpty($string)) {
			// Reset the format into the response object
			this.mFormat = $string.toLowerCase();
		}
		// Return the format from the response object
		return this.mFormat;
	};

	/**
	 * This method returns the template to be rendered from the response object with the ability to reset it inline
	 * @name Express.Response.template()
	 * @param {string, optional} $string
	 * @returns {string}
	 */
	$httpResponse.template = function ($string) {
		// Check for a provided template name
		if ($lodash.isString($string) && !$lodash.isEmpty($string)) {
			// Reset the template name into the response object
			this.content('tpl::' + $string);
		}
		// Return the template name from the response object
		return ((this.content().substr(0, 5) === 'tpl::') ? this.content().substr(5) : '');
	};

	/**
	 * This method returns a value from the response object payload with the ability to reset it inline
	 * @name Express.Response.value()
	 * @param {string} $name
	 * @param {*, optional} $value
	 * @returns {*}
	 */
	$httpResponse.value = function ($name, $value) {
		// Check for a provided value
		if (!$lodash.isUndefined($value)) {
			// Reset the value into the response object
			this.mValues[$name] = $value;
		}
		// Return the value from the response object
		return this.mValues[$name];
	};

	/**
	 * This method returns the response object payload with the ability to reset it inline
	 * @name Express.Response.values()
	 * @param {Object.<String, *>, optional} $object
	 * @returns {Object.<String, *>}
	 */
	$httpResponse.values = function ($object) {
		// Check for a provided values payload
		if (!$lodash.isObject($object)) {
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
}; /// End Response Module Definition ////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

