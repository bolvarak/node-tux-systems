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
const Sequelize = require('sequelize') ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $publicSuffix = require('./PublicSuffix'); /// PublibSuffix Library ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ModelPowerDNSResult = require('../Model/PowerDNS/Result'); /// PowerDNS Result Model ///////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = class LibraryPowerDNS { /// LibraryPowerDNS Class Definition ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Constructor //////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method instantiates a new PowerDNS Library instance
	 * @name LibraryPowerDNS.constructor()
	 * @param {Sequelize.Model} $queryModel
	 * @param {log4js.Logger} $logger
	 */
	constructor($queryModel, $logger) {

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// Properties ///////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * This property contains the instance of our logging module
		 * @name LibraryPowerDNS.mLogger
		 * @type {log4js.Logger}
		 */
		this.mLogger = $logger;

		/**
		 * This property contains the method translation map
		 * @name LibraryPowerDNS.mMethods
		 * @type {Object.<string, string>}
		 */
		this.mMethods = {
			'aborttransaction': '_abortTransaction',
			'activatedomainkey': '_activateDomainKey',
			'adddomainkey': '_addDomainKey',
			'calculatesoaserial': '_calculateSoaSerial',
			'committransaction': '_commitTransaction',
			'createslavedomain': 'createSlaveDomain',
			'deactivatedomainkey': '_deactivateDomainKey',
			'directbackendcmd': '_directBackendCommand',
			'feedents': '_feedEnts',
			'feedents3': '_feedEnts3',
			'feedrecord': '_feedRecord',
			'getalldomainmetadata': '_getAllDomainMetaData',
			'getalldomains': '_getAllDomains',
			'getbeforeandafternamesabsolute': '_getBeforeAndAfterNamesAbsolute',
			'getdomaininfo': '_getDomainInfo',
			'getdomainkeys': '_getDomainKeys',
			'getdomainmetadata': '_getDomainMetaData',
			'gettsigkey': '_getTsigKey',
			'initialize': '_initialize',
			'ismaster': '_isMaster',
			'list': '_list',
			'lookup': '_lookup',
			'removedomainkey': '_removeDomainKey',
			'replacerrset': '_replaceRrSet',
			'searchrecords': '_searchRecords',
			'setdomainmetadata': '_setDomainMetaData',
			'setnotified': '_setNotified',
			'starttransaction': '_startTransaction',
			'supermasterbackend': '_superMasterBackend'
		};

		/**
		 * This property contains the query model instance for the incoming request
		 * @name LibraryPowerDNS.mQuery
		 * @type {Sequelize.Model}
		 */
		this.mQuery = $queryModel;

		/**
		 * This property contains the result to send back to PowerDNS
		 * @name LibraryPowerDNS.mResult
		 * @type {Object.<string, any>}
		 */
		this.mResult = new ModelPowerDNSResult();

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	} /// End Constructor ////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Private Methods //////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method is a default response and is sent when a method is unsupported
	 * @async
	 * @name LibraryPowerDNS.__unsupported()
	 * @returns {Promise.<void>}
	 * @private
	 * @uses LibraryPowerDNS.query()
	 * @uses LibraryPowerDNS.logger()
	 * @uses LibraryPowerDNS.result()
	 * @uses ModelPowerDNSResult.unsuccessful()
	 * @uses ModelPowerDNSResult.logEntry()
	 */
	async __unsupported() {
		// Define the message
		let $message = $utility.util.format('Method [%s] Is Not Supported', this.query().request.method);
		// Log the message
		this.logger().warn($message);
		// Set the result flag
		this.result().unsuccessful();
		// Add the log message
		this.result().logEntry($message);
	}

	/**
	 * This method initializes the backend, it does nothing since NodeJS doesn't need to be initialized, so we just bootstrap the response
	 * @async
	 * @name LibraryPowerDNS._initialize()
	 * @param {Object.<string, any>} $parameters
	 * @returns {Promise.<void>}
	 * @private
	 * @uses LibraryPowerDNS.result()
	 * @uses ModelPowerDNSResult.successful()
	 * @uses ModelPowerDNSResult.logEntry()
	 */
	async _initialize($parameters) {
		// Set the result flag
		this.result().successful();
		// Add the log message
		this.result().logEntry('Tux.Systems Initialized');
	}

	/**
	 * This method performs a lookup on a record
	 * @async
	 * @name LibraryPowerDNS._lookup()
	 * @param {Object.<string, any>} $parameters
	 * @returns {Promise.<void>}
	 * @private
	 * @uses LibraryPowerDNS.result()
	 * @uses ModelPowerDNSResult.unsuccessful()
	 * @uses ModelPowerDNSResult.logEntry()
	 * @uses ModelPowerDNSResult.recordEntry()
	 */
	async _lookup($parameters) {
		// Define our start
		let $start = new Date();
		// Parse the hostname
		let $hostName = await $publicSuffix.parse($parameters.qname);
		// Define our finish
		let $finish = new Date();
		// Send the response
		this.mResult = {
			'hostName': $hostName.host(),
			'domainName': $hostName.domain(),
			'port': $hostName.port(),
			'tld': $hostName.tld(),
			'source': $hostName.source(),
			'_timeTaken': ($finish.getTime() - $start.getTime())
		};
		// We're done
		return;
		// Check for a domain
		if ($utility.lodash.isNull($domain)) {
			// Reset the result flag and log message in the response
			this.failure().log($utility.util.format('Domain [%s] Not Found', $hostName.domain()));
			// We're done
			return;
		}
		// Reset the result flag and log message in the response
		this.failure().log($utility.util.format('Host [%s] Not Found', $hostName.host()));
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method generates and sends the response
	 * @async
	 * @name LibraryPowerDNS.response()
	 * @returns {Promise.<LibraryPowerDNS>}
	 * @uses LibraryPowerDNS.query()
	 * @uses LibraryPowerDNS.result()
	 * @uses LibraryPowerDNS.__unsupported()
	 * @uses LibraryPowerDNS._initialize()
	 * @uses LibraryPowerDNS._lookup()
	 * @uses ModelPowerDNSResult.unsuccessful()
	 * @uses ModelPowerDNSResult.logEntry()
	 */
	async response() {
		// Try to process the query to elicit a response
		try {
			// Check for the method on the instance
			if (!this.mMethods[this.query().request.method]) {
				// Execute the unsupported method
				await this.__unsupported(this.query().request.parameters);
			} else {
				// Execute the method
				await this[this.mMethods[this.query().request.method]].apply(this, [this.query().request.parameters]);
			}
			// Set the response into the query model
			this.query().response = this.result();
			// Try to save the response
			try {
				// Save the query model
				await this.query().save();
				// We're done, return the instance
				return this;;
			} catch ($error) {
				// Log the error
				this.logger().error($error);
				// Set the result flag
				this.result().unsuccessful();
				// Add the log message
				this.result().logEntry($error.message);
				// We're done, return the instance
				return this;
			}
			// We're done
		} catch ($error) {
			// Log the error
			this.logger().error($error);
			// Set the result flag
			this.result().unsuccessful();
			// Add the log message
			this.result().logEntry($error.message);
			// Set the response into the query model
			this.query().response = this.result();
			// Try to save the response
			try {
				// Save the query model
				await this.query().save();
				// We're done, return the instance
				return this;
			} catch($error) {
				// Log the error
				this.logger().error($error);
				// Set the result flag
				this.result().unsuccessful();
				// Add the log message
				this.result().logEntry($error.message);
				// We're done, return the instance
				return this;
			}
		}
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Inline Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method returns the logger from the instance
	 * @name LibraryPowerDNS.logger()
	 * @returns {log4js.Logger}
	 */
	logger() {
		// Return the logger from the instance
		return this.mLogger;
	}

	/**
	 * This method returns the PowerDNS query model from the instance with the ability to reset it inline
	 * @name LibraryPowerDNS.query()
	 * @param {Sequelize.Model, optional} $queryModel [undefined]
	 * @returns {Sequelize.Model}
	 */
	query($queryModel = undefined) {
		// Check for a provided query model
		if ($queryModel instanceof Sequelize.Model) {
			// Reset the query model into the instance
			this.mQuery = $queryModel;
		}
		// We're done, return the query model from the instance
		return this.mQuery;
	}

	/**
	 * This method returns the query result from the instance with the ability to reset it inline
	 * @name LibraryPowerDNS.result()
	 * @param {ModelPowerDNSResult, optional} $result [undefined]
	 * @returns {ModelPowerDNSResult}
	 */
	result($result = undefined) {
		// Check for a provided result
		if ($result instanceof ModelPowerDNSResult) {
			// Reset the result into the instance
			this.mResult = $result;
		}
		// We're done, return the result from the instance
		return this.mResult;
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End LibraryPowerDNS Class Definition //////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
