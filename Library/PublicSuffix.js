///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $config = require('../Common/Configuration'); /// Configuration Settings ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $db = require('../Common/Database'); /// Database Connection ///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $utility = require('../Common/Utility'); /// Utility Module ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $cache = require('./Cache'); /// Cache Module //////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $request = require('request-promise-native'); /// HTTP Request Module //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $path = require('path'); /// Path Module ///////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class LibraryPublicSuffix { /// LibraryPublicSuffix Class Definition /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method sets the port number into the instance from the source
	 * @async
	 * @name LibraryPublicSuffix.processPort()
	 * @returns {Promise<void>}
	 * @static
	 * @private
	 * @uses LibraryPublicSuffix.port()
	 */
	static async processPort() {
		// Match the port number
		let $matches = this.mSource.match(/:([0-9]+?$)/);
		// Check for matches
		if ($matches && ($matches.length >= 2)) {
			// Set the port into the instance
			this.port(parseInt($matches[1]));
		} else {
			// Set the port into the instance
			this.port(0);
		}
	}

	/**
	 * This method determines the top-level domain name from the source hostname
	 * @async
	 * @name LibraryPublicSuffix.processTld()
	 * @returns {Promise<void>}
	 * @static
	 * @private
	 * @uses LibraryPublicSuffix.source()
	 * @uses LibraryPublicSuffix.database()
	 * @uses LibraryPublicSuffix.tld()
	 * @uses LibraryPublicSuffix.domain()
	 */
	static async processTld() {
		// Split the domain into parts
		let $parts = [];
		// Iterate over the parts
		this.source().replace(':'.concat(this.mPort), '').trim().split(/\./).each(($part) => {
			// Check the part
			if (!$utility.lodash.isEmpty($part)) {
				// Add the part to the container
				$parts.push($part);
			}
		});
		// Set the found flag
		let $found = false;
		// Set the current working part
		let $workingTld = $parts[($parts.length - 1)];
		// Remove the last element from the array
		$parts.pop();
		// Iterate until we have found the TLD
		while (!$found) {
			// Query for the TLD
			let $tld = await $db.model('dnsDomainTld').findOne({
				'where': {
					'name': {
						[$db.Operator.eq]: $workingTld.toLowerCase()
					}
				}
			});
			// Iterate over the public suffix data
			if (!$utility.lodash.isNull($tld)) {
				// Reset the found flag
				$found = true;
			} else {
				// Update the workding TLD
				$workingTld = $workingTld.concat('.', $parts[($parts.length - 1)]);
				// Remove the last element of the array
				$parts.pop();
			}
		}
		// Set the top-level domain into the instance
		this.tld($workingTld);
		// Set the domain into the instance
		this.domain(''.concat($parts[($parts.length - 1)], '.', $workingTld));
		// Set the host name
		this.host($parts[($parts.length - 2)] || null);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method downloads the PublicSuffix database and stores it in cache
	 * @async
	 * @name LibraryPublicSuffix.downloadDatabase()
	 * @returns {Promise.<void>}
	 * @static
	 */
	static async downloadDatabase() {
		// Load the Public Suffix data
		let $response = await $request.get('https://publicsuffix.org/list/public_suffix_list.dat');
		// Define our data
		let $data = [];
		// Iterate over the data
		$response.split(/\n/).each(($line) => {
			// Check for an empty line or comment
			if (!$utility.lodash.isEmpty($line.trim()) && !$line.trim().match(/^(\/\/|#)/)) {
				// Add the tld to the list
				$data.push($line.replace(/(!|\*\.?)/g, '').trim().toLowerCase());
			}
		});
		// Write the cache file
		await $cache.write('public.suffix.dat', JSON.stringify($data), false);
	}

	/**
	 * This method opens the PublicSuffix database from cache
	 * @async
	 * @name LibraryPublicSuffix.openDatabase()
	 * @returns {Promise.<void>}
	 * @static
	 * @uses LibraryPublicSuffix.downloadDatabase()
	 * @uses LibraryPublicSuffix.database()
	 */
	static async openDatabase() {
		// Check to see if the cache file exists
		if (!await $cache.exists('public.suffix.dat')) {
			// Download the database
			await this.downloadDatabase();
		}
		// Try to read the data
		try {
			// Read the cache file
			this.database(JSON.parse(await $cache.read('public.suffix.dat')));
		} catch ($error) {
			// Check the error code
			if ($error.code && ($error.code.toLowerCase() === 'tuxcacheexpired')) {
				// Download the database
				await this.downloadDatabase();
				// Open the database
				await this.openDatabase();
			} else {
				// Throw the error
				throw $error;
			}
		}
	}

	/**
	 * This method parses a hostname
	 * @async
	 * @name LibraryPublicSuffix.parse()
	 * @param {string} $hostname
	 * @returns {Promise.<LibraryPublicSuffix>}
	 * @static
	 * @uses LibraryPublicSuffix.source()
	 * @uses LibraryPublicSuffix.openDatabase()
	 * @uses LibraryPublicSuffix.processTld()
	 * @uses LibraryPublicSuffix.processPort()
	 */
	static async parse($hostname) {
		// Set the source into the instance
		this.source($hostname);
		// Parse the TLD
		await this.processTld();
		// Parse the port number
		await this.processPort();
		// We're done, return the instance
		return this;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Inline Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method returns the PublicSuffix database from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.database()
	 * @param {Array.<string>, optional} $publicSuffixData [undefined]
	 * @returns {Array.<string>}
	 * @static
	 */
	static database($publicSuffixData = undefined) {
		// Check for provided PublicSuffix data
		if ($publicSuffixData !== undefined) {
			// Reset the PublicSuffix data into the instance
			this.mPublicSuffixData = $publicSuffixData;
		}
		// We're done, return the PublicSuffix data from the instance
		return this.mPublicSuffixData;
	}

	/**
	 * This method returns the domain name from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.domain()
	 * @param {string, optional} $domainName [undefined]
	 * @returns {string}
	 * @static
	 */
	static domain($domainName = undefined) {
		// Check for a provided domain name
		if ($domainName !== undefined) {
			// Reset the domain name into the instance
			this.mDomain = $domainName;
		}
		// We're done, return the domain name from the instance
		return this.mDomain;
	}

	/**
	 * This method returns the hostname from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.host()
	 * @param {string, optional} $hostName [undefined]
	 * @returns {string}
	 * @static
	 */
	static host($hostName = undefined) {
		// Check for a provided hostname
		if ($hostName !== undefined) {
			// Reset the hostname into the instance
			this.mHost = $hostName;
		}
		// We're done, return the hostname from the instance
		return this.mHost;
	}

	/**
	 * This method returns the port number from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.port()
	 * @param {integer, optional} $port [undefined]
	 * @returns {integer}
	 * @static
	 */
	static port($port = undefined) {
		// Check for a provided port
		if ($port !== undefined) {
			// Reset the port into the instance
			this.mPort = $port;
		}
		// We're done, return the port from the instance
		return this.mPort;
	}

	/**
	 * This method returns the source from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.source()
	 * @param {string, optional} $hostName [undefined]
	 * @returns {string}
	 * @static
	 */
	static source($hostName = undefined) {
		// Check for a provided source
		if ($hostName !== undefined) {
			// Reset the source into the instance
			this.mSource = $hostName;
		}
		// We're done, return the source from the instance
		return this.mSource;
	}

	/**
	 * This method returns the top-level domain from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.tld()
	 * @param {string, optional} $topLevelDomain [undefined]
	 * @returns {string}
	 * @static
	 */
	static tld($topLevelDomain = undefined) {
		// Check for a provided top-level domain
		if ($topLevelDomain !== undefined) {
			// Reset the top-level domain into the instance
			this.mTopLevelDomain = $topLevelDomain;
		}
		// We're done, return the top-level domain from the instance
		return this.mTopLevelDomain;
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End LibraryPublicSuffix Class Definition //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// LibraryPublicSuffix Static Properties ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This property contains the second-level domain name for the hostname
 * @name LibraryPublicSuffix.mDomain
 * @type {string}
 */
this.mDomain = '';

/**
 * This property contains the sub-level host for the hostname
 * @name LibraryPublicSuffix.mHost
 * @type {string}
 */
this.mHost = '';

/**
 * This property contains the port for the hostname
 * @name LibraryPublicSuffix.mPort
 * @var {number}
 */
this.mPort = 0;

/**
 * This property contains the public suffix data in a usable format
 * @name LibraryPublicSuffix.mPublicSuffixData
 * @type {Array<number, string>}
 */
this.mPublicSuffixData = [];

/**
 * This property contains the source hostname that was parsed
 * @name LibraryPublicSuffix.mSource
 * @type {string}
 */
this.mSource = '';

/**
 * This property contains the top level domain (TLD) of the hostname
 * @name LibraryPublicSuffix.mTopLevelDomain
 * @type {string}
 */
this.mTopLevelDomain = '';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = LibraryPublicSuffix; /// LibraryPublicSuffix Module Definition //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
