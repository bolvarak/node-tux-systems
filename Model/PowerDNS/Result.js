///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $utility = require('../../Common/Utility'); /// Utility Module /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = class ModelPowerDNSResult { /// ModelPowerDNSResult Class Definition ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Constructor //////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method instantiates a new PowerDNS result model
	 * @name ModelPowerDNSResult.constructor()
	 */
	constructor() {

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// Properties ///////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * This property contains the log for the result
		 * @name ModelPowerDNSResult.mLog
		 * @type {Array.<string>}
		 */
		this.mLog = [];

		/**
		 * This property contains the result records or flag
		 * @name ModelPowerDNSResult.mResult
		 * @type {Array.<Object.<string, any>>|boolean}
		 */
		this.mResult = false;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Record Bootstrapper Methods //////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method adds a DNS A record to the result
	 * @name ModelPowerDNSResult.a()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {string} $content
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	a($name, $ttl, $content, $auth = true) {
		// Define our record object
		let $record = {};
		// Define the type
		$record.qtype = 'A';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the domain ID
		$record.domain_id = $domainId;
		// Define the content
		$record.content = $content;
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}

	/**
	 * This method adds a DNS AAAA record to the result
	 * @name ModelPowerDNSResult.aaaa()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {string} $content
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	aaaa($name, $ttl, $content, $auth = true) {
		// Define our record object
		let $record = {};
		// Define the type
		$record.qtype = 'AAAA';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the content
		$record.content = $content;
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}

	/**
	 * This method adds a DNS CAA record to the result
	 * @name ModelPowerDNSResult.caa()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {number} $flags
	 * @param {string} $tag
	 * @param {string} $content
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	caa($name, $ttl, $flags, $tag, $content, $auth = true) {
		// Define our record
		let $record = {};
		// Define the type
		$record.qtype = 'CAA';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the content
		$record.content = $utility.util.format('%d %s %s', $flags, $tag, $content);
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}

	/**
	 * This method adds a DNS CNAME record to the result
	 * @name ModelPowerDNSResult.cname()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {string} $content
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	cname($name, $ttl, $content, $auth = true) {
		// Define our record
		let $record = {};
		// Define the type
		$record.qtype = 'CNAME';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the content
		$record.content = $content;
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}


	dnssec($name, $ttl, $flags, $tag, $content, $auth = true) {
		// TODO - Hash out DNSSEC
	}

	/**
	 * This method adds a DNS MX record to the result
	 * @name ModelPowerDNSResult.mx()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {string} $content
	 * @param {number} $priority
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	mx($name, $ttl, $content, $priority, $auth = true) {
		// Define our record object
		let $record = {};
		// Define the type
		$record.qtype = 'MX';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the content
		$record.content = $utility.util.format('%d %s', $priority, $content);
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}

	/**
	 * This method adds a DNS NS record to the result
	 * @name ModelPowerDNSResult.ns()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {string} $content
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	ns($name, $ttl, $content, $auth = true) {
		// Define our record
		let $record = {};
		// Define the type
		$record.qtype = 'NS';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the content
		$record.content = $content;
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}

	/**
	 * This method adds an SOA record to the result
	 * @name ModelPowerDNSResult.soa()
	 * @param {string} $zone
	 * @param {string} $nameServer
	 * @param {string} $hostMaster
	 * @param {number} $serial
	 * @param {number} $refresh
	 * @param {number} $retry
	 * @param {number} $expire
	 * @param {number} $ttl
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	soa($zone, $nameServer, $hostMaster, $serial, $refresh, $retry, $expire, $ttl) {
		// Modify the nameserver
		$nameServer = $nameServer.replace(/\.+$/, '').trim().concat('.');
		// Modify the hostmaster
		$hostMaster = $hostMaster.replace(/\.+$/, '').replace(/@/, '.').trim().concat('.');
		// Define our record object
		let $record = {};
		// Define the type
		$record.qtype = 'SOA';
		// Define the zone name
		$record.qname = $zone;
		// Define the content
		$record.content = $utility.util.format('%s %s %d %d %d %d %d', $nameServer, $hostMaster, $serial, $refresh, $retry, $expire, $ttl);
		// Define the TTL
		$record.ttl = $ttl;
		// Add the record to the result
		return this.add($record);
	}

	/**
	 * This method adds a DNS SRV record to the result
	 * @name ModelPowerDNSResult.srv()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {string} $content
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	srv($name, $ttl, $priority, $weight, $port, $content, $auth = true) {
		// Define our record
		let $record = {};
		// Define the type
		$record.qtype = 'SRV';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the content
		$record.content = $utility.util.format('%d %d %d %s',$priority, $weight, $port, $content);
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}

	/**
	 * This method adds a DNS TXT record to the result
	 * @name ModelPowerDNSResult.txt()
	 * @param {string} $name
	 * @param {number} $ttl
	 * @param {string} $content
	 * @param {boolean, optional} $auth [true]
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.add()
	 */
	txt($name, $ttl, $content, $auth = true) {
		// Define our record
		let $record = {};
		// Define the type
		$record.qtype = 'TXT';
		// Define the name
		$record.qname = $name;
		// Define the TTL
		$record.ttl = $ttl;
		// Define the content
		$record.content = $content;
		// Define the authority
		$record.auth = $auth;
		// Add the record to the result
		return this.add($record);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method appends a record to the result list
	 * @name ModelPowerDNSResult.add()
	 * @param {Object.<string, any>} $record
	 * @returns {ModelPowerDNSResult}
	 */
	add($record) {
		// Check to see if the result is a boolean
		if ($utility.lodash.isBoolean(this.mResult)) {
			// Reset the result
			this.mResult = [];
		}
		// Add the record to the result
		this.mResult.push($record);
		// We're done, return the instance
		return this;
	}

	/**
	 * This method adds a log entry to the result
	 * @name ModelPowerDNSResult.log()
	 * @param {string} $message
	 * @returns {ModelPowerDNSResult}
	 */
	log($message) {
		// Add the log entry to the instance
		this.mLog.push($message);
		// We're done, return the instance
		return this;
	}

	/**
	 * This method determines what method to execute based on the record type
	 * @name ModelPowerDNSResult.record()
	 * @param {Sequelize.models.dnsRecord}
	 * @returns {ModelPowerDNSResult}
	 * @uses ModelPowerDNSResult.a()
	 * @uses ModelPowerDNSResult.aaaa()
	 * @uses ModelPowerDNSResult.caa()
	 * @uses ModelPowerDNSResult.cname()
	 * @uses ModelPowerDNSResult.dnssec()
	 * @uses ModelPowerDNSResult.mx()
	 * @uses ModelPowerDNSResult.ns()
	 * @uses ModelPowerDNSResult.srv()
	 * @uses ModelPowerDNSResult.txt()
	 */
	record($record) {
		// Localize the type
		let $type = $record.type.toLowerCase();
		// Check the record type
		if ($type === 'a') {
			// Return the A record bootstrapper
			return this.a($record.host, $record.ttl, $record.target);
		} else if ($type === 'aaaa') {
			// Return the AAAA record bootstrapper
			return this.aaaa($record.host, $record.ttl, $record.target);
		} else if ($type === 'caa') {
			// Return the CAA record bootstrapper
			return this.caa($record.host, $record.ttl, $record.flag, $record.tag, $record.target);
		} else if ($type === 'cname') {
			// Return the CNAME record bootstrapper
			return this.cname($record.host, $record.ttl, $record.target);
		} else if ($type === 'dnssec') {
			// Return the DNSSEC record bootstrapper
			return this;
		} else if ($type === 'mx') {
			// Return the MX record bootstrapper
			return this.mx($record.host, $record.ttl, $record.target, $record.priority);
		} else if ($type === 'ns') {
			// Return the NS record bootstrapper
			return this.ns($record.host, $record.ttl, $record.target);
		} else if ($type === 'srv') {
			// Return the SRV record bootstrapper
			return this.srv($record.host, $record.ttl, $record.priority, $record.weight, $record.port, $record.target);
		} else if ($type === 'txt') {
			// Return the TXT record bootstrapper
			return this.txt($record.host, $record.ttl, $record.target);
		} else {
			// We're done, return the instance, the record type is unsupported
			return this;
		}
	}

	/**
	 * This method sets the result to a hard success
	 * @name ModelPowerDNSResult.successful()
	 * @returns {ModelPowerDNSResult}
	 */
	successful() {
		// Reset the result to true
		this.mResult = true;
		// We're done, return the instance
		return this;
	}

	/**
	 * This method sets the result to a hard failure
	 * @name ModelPowerDNSResult.unsuccessful()
	 * @returns {ModelPowerDNSResult}
	 */
	unsuccessful() {
		// Reset the result to false
		this.mResult = false;
		// We're done, return the instance
		return this;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Converters ///////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method converts the result to a JSON payload
	 * @name ModelPowerDNSResult.toJson()
	 * @returns {string}
	 * @uses ModelPowerDNSResult.toObject()
	 */
	toJson() {
		// Return the JSON encoded result
		return JSON.stringify(this.toObject());
	}

	/**
	 * This method converts the result to a payload
	 * @name ModelPowerDNSResult.toObject()
	 * @returns {Object.<string, any>}
	 */
	toObject() {
		// Return the object format of our result
		return {
			'result': this.mResult,
			'log': this.mLog
		};
	}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End ModelPowerDNSResult Class Definition //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
