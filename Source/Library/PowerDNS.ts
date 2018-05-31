///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import $config from '../Common/Configuration'; /// Configuration Settings ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 /// Database Connection ///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import $utility from '../Common/Utility'; /// Utility Module /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import $publicSuffix from './PublicSuffix'; /// PublibSuffix Library /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import PowerDnsResult from '../Model/PowerDNS/Result'; /// PowerDNS Result Model /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export default class LibraryPowerDNS { /// LibraryPowerDNS Class Definition //////////////////////////////////////////
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
	 * This method performs a lookup for a domain and its associated user
	 * @async
	 * @name LibraryPowerDNS._lookupDomain()
	 * @param {string} $domainName
	 * @returns {Promise.<Sequelize.Model>}
	 * @throws {Error}
	 * @private
	 */
	async _lookupDomain($domainName) {
		// Load the domain
		let $domain = await $db.model('dnsDomain').findOne({
			'where': {
				'isActive': {
					[$db.Operator.eq]: true
				},
				'name': {
					[$db.Operator.eq]: $domainName.toLowerCase()
				}
			}
		});
		// Check for a domain
		if ($utility.lodash.isNull($domain)) {
			// Throw the exception
			throw new Error($utility.util.format('Zone [%s] Not Found', $domainName));
		}
		// We're done, return the domain
		return $domain;
	}

	/**
	 * This method looks up the records for the domain
	 * @async
	 * @name LibraryPowerDNS._lookupDomainRecords()
	 * @param {uuid} $domainId
	 * @param {string} $domainName
	 * @param {string, optional} $host [null]
	 * @param {string, optional} $type ['ANY']
	 * @returns {Promise.<void>}
	 * @private
	 */
	async _lookupDomainRecords($domainId, $domainName, $host = null, $type = 'ANY') {
		// Define our record clause
		let $clause = {};
		// Define the WHERE clause
		$clause.where = {};
		// Set the active flag into the WHERE clause
		$clause.where.isActive = {[$db.Operator.eq]: true};
		// Set the domain ID into the WHERE clause
		$clause.where.domainId = {[$db.Operator.eq]: $domainId};
		// Check the query type
		if (($type.toLowerCase() !== 'any')) {
			// Add the record type to the clause
			$clause.where.type = {
				[$db.Operator.eq]: $type.toUpperCase()
			};
		}
		// Check the host name
		if ($utility.lodash.isNull($host)) {
			// Add the host to the clause
			$clause.where.host = {
				[$db.Operator.eq]: '@'
			};
		} else {
			// Add the host to the clause
			$clause.where.host = {
				[$db.Operator.eq]: $host.toLowerCase(),
			}
		}
		// Query for the record(s)
		let $records = await $db.model('dnsRecord').findAll($clause);
		// Check for records
		if ((!$records || !$records.length) && !$utility.lodash.isNull($host)) {
			// Update the host name
			$clause.where.host = {
				[$db.Operator.eq]: '*'
			}
			// Execute the query await
			$records = await $db.model('dnsRecord').findAll($clause);
		}
		// Check for records
		if (!$records || !$records.length) {
			// Log the message
			this.result().log($utility.util.format('Zone [%s] Has No Records', $domainName));
			// We're done
			return;
		}
		// Default the record ID list
		this.query().recordId = [];
		// Log the message
		this.result().log($utility.util.format('Zone [%s] Has [%d] Records', $domainName, $records.length));
		// Iterate over the records
		$records.each(async ($record) => {
			// Localize the host
			let $recordHost = $record.host;
			// Check the record host
			if ($recordHost === '@') {
				// Reset the host
				$recordHost = $domainName;
			} else if ($recordHost === '*') {
				// Reset the host
				$recordHost = ($host + '.' + $domainName);
			} else {
				// Reset the host
				$recordHost = ($recordHost + '.' + $domainName);
			}
			// Reset the record host
			$record.host = $recordHost;
			// Add the record to the result
			await this.result().record($record);
			// Set the record ID into the query
			this.query().recordId.push($record.id.toString());
		});
	}

	/**
	 * This method looks up the records for the domain when an AXFR is requested
	 * @async
	 * @name LibraryPowerDNS._lookupDomainRecordsForTransfer()
	 * @param {uuid} $domainId
	 * @param {string} $domainName
	 * @returns {Promise.<void>}
	 * @private
	 */
	async _lookupDomainRecordsForTransfer($domainId, $domainName) {
		// Define our record clause
		let $clause = {};
		// Define the WHERE clause
		$clause.where = {};
		// Set the active flag into the WHERE clause
		$clause.where.isActive = {[$db.Operator.eq]: true};
		// Set the domain ID into the WHERE clause
		$clause.where.domainId = {[$db.Operator.eq]: $domainId};
		// Query for the record(s)
		let $records = await $db.model('dnsRecord').findAll($clause);
		// Check for records
		if (!$records || !$records.length) {
			// Log the message
			this.result().log($utility.util.format('Zone [%s] Has No Records', $domainName));
			// We're done
			return;
		}
		// Default the record ID list
		this.query().recordId = [];
		// Log the message
		this.result().log($utility.util.format('Zone [%s] Has [%d] Records', $domainName, $records.length));
		// Iterate over the records
		$records.each(async ($record) => {
			// Localize the host
			let $recordHost = $record.host;
			// Check the record host
			if ($recordHost === '@') {
				// Reset the host
				$recordHost = $domainName;
			} else {
				// Reset the host
				$recordHost = ($recordHost + '.' + $domainName);
			}
			// Reset the record host
			$record.host = $recordHost;
			// Add the record to the result
			await this.result().record($record);
			// Set the record ID into the query
			this.query().recordId.push($record.id.toString());
		});
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Handler Methods //////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method initializes the backend, it does nothing since NodeJS doesn't need to be initialized, so we just bootstrap the response
	 * @async
	 * @name LibraryPowerDNS.initialize()
	 * @param {Object.<string, any>} $parameters
	 * @returns {Promise.<void>}
	 * @uses LibraryPowerDNS.result()
	 * @uses ModelPowerDNSResult.successful()
	 * @uses ModelPowerDNSResult.log()
	 */
	async initialize($parameters) {
		// Set the result flag
		this.result().successful();
		// Add the log message
		this.result().log('Tux.Systems Initialized');
	}

	/**
	 * This method performs an AXFR on a zone
	 * @async
	 * @name LibraryPowerDNS.list()
	 * @param {Object.<string, any>} $parameters
	 * @returns {Promise.<void>}
	 * @uses LibraryPowerDNS._lookupDomain()
	 * @uses LibraryPowerDNS._lookupDomainRecords()
	 * @uses LibraryPowerDNS.result()
	 * @uses ModelPowerDNSResult.unsuccessful()
	 * @uses ModelPowerDNSResult.log()
	 * @uses ModelPowerDNSResult.record()
	 */
	async list($parameters) {
		// Define our start
		let $start = new Date();
		// Log the start
		this.result().log('Start:' + $start.getTime());
		// Parse the hostname
		let $hostName = await $publicSuffix.parse($parameters.zonename);
		// Load the domain and user
		let $domain = await this._lookupDomain($hostName.domain());
		// Log the message
		this.result().log($utility.util.format('Zone [%s] Matched', $hostName.domain()));
		// Set the domain ID into the query
		this.query().domainId = $domain.id;
		// Set the user ID into the query
		this.query().userId = $domain.userId;
		// Add the SOA record
		this.result().soa($domain.name, $domain.nameServer[0], $domain.serial, $domain.refresh, $domain.retry, $domain.expire, $domain.ttl);
		// Process the records
		await this._lookupDomainRecordsForTransfer($domain.id, $domain.name);
		// Define our finish
		let $finish = new Date();
		// Log the finish
		this.result().log('Finish:' + $finish.getTime());
		// Log the time taken
		this.result().log('TimeTaken:' + ($finish.getTime() - $start.getTime()));
		// We're done
		return;
	}

	/**
	 * This method performs a lookup on a record
	 * @async
	 * @name LibraryPowerDNS.lookup()
	 * @param {Object.<string, any>} $parameters
	 * @returns {Promise.<void>}
	 * @uses LibraryPowerDNS._lookupDomain()
	 * @uses LibraryPowerDNS._lookupDomainRecords()
	 * @uses LibraryPowerDNS.result()
	 * @uses ModelPowerDNSResult.unsuccessful()
	 * @uses ModelPowerDNSResult.log()
	 * @uses ModelPowerDNSResult.record()
	 */
	async lookup($parameters) {
		// Define our start
		let $start = new Date();
		// Log the start
		this.result().log('Start:' + $start.getTime());
		// Parse the hostname
		let $hostName = await $publicSuffix.parse($parameters.qname);
		// Loojup the domain and user
		let $domain = await this._lookupDomain($hostName.domain());
		// Log the message
		this.result().log($utility.util.format('Zone [%s] Matched', $hostName.domain()));
		// Set the domain ID into the query
		this.query().domainId = $domain.id;
		// Set the user ID into the query
		this.query().userId = $domain.userId;
		// Check for a SOA type
		if ($parameters.qtype.toLowerCase() === 'soa') {
			// Add the SOA record
			this.result().soa($domain.name, $domain.nameServer[0], $domain.serial, $domain.refresh, $domain.retry, $domain.expire, $domain.ttl);
		} else {
			// Lookup the records for the domain
			await this._lookupDomainRecords($domain.id, $domain.name, $hostName.host(), $parameters.qtype);
		}
		// Define our finish
		let $finish = new Date();
		// Log the finish
		this.result().log('Finish:' + $finish.getTime());
		// Log the time taken
		this.result().log('TimeTaken:' + ($finish.getTime() - $start.getTime()));
		// We're done
		return;
	}

	/**
	 * This method is a default response and is sent when a method is unsupported
	 * @async
	 * @name LibraryPowerDNS.unsupported()
	 * @returns {Promise.<void>}
	 * @private
	 * @uses LibraryPowerDNS.query()
	 * @uses LibraryPowerDNS.logger()
	 * @uses LibraryPowerDNS.result()
	 * @uses ModelPowerDNSResult.unsuccessful()
	 * @uses ModelPowerDNSResult.log()
	 */
	async unsupported() {
		// Define the message
		let $message = $utility.util.format('Method [%s] Is Not Supported', this.query().request.method);
		// Log the message
		this.logger().warn($message);
		// Set the result flag
		this.result().unsuccessful();
		// Add the log message
		this.result().log($message);
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
	 * @uses ModelPowerDNSResult.log()
	 */
	async response() {
		// Try to process the query to elicit a response
		try {
			// Check for the method on the instance
			switch(this.query().request.method.toLowerCase()) {
				// initialize()
				case 'initialize': await this.initialize(this.query().request.parameters); break;
				// list()/axfr()
				case 'list': await this.list(this.query().request.parameters); break;
				// lookup()
				case 'lookup': await this.lookup(this.query().request.parameters);break;
				case 'aborttransaction':
				case 'activatedomainkey':
				case 'adddomainkey':
				case 'calculatesoaserial':
				case 'committransaction':
				case 'createslavedomain':
				case 'deactivatedomainkey':
				case 'directbackendcmd':
				case 'feedents':
				case 'feedents3':
				case 'feedrecord':
				case 'getalldomainmetadata':
				case 'getalldomains':
				case 'getbeforeandafternamesabsolute':
				case 'getdomaininfo':
				case 'getdomainkeys':
				case 'getdomainmetadata':
				case 'gettsigkey':
				case 'ismaster':
				case 'removedomainkey':
				case 'replacerrset':
				case 'searchrecords':
				case 'setdomainmetadata':
				case 'setnotified':
				case 'starttransaction':
				case 'supermasterbackend':
				// Unsupported
				default: await this.unsupported(this.query().request.parameters); break;
			}
			// Set the response into the query model
			this.query().response = this.result().toObject();
			// Try to save the response
			try {
				// Save the query model
				await this.query().save();
				// We're done, return the instance
				return this;
			} catch ($error) {
				// Log the error
				this.logger().error($error.message);
				// Set the result flag
				this.result().unsuccessful();
				// Add the log message
				this.result().log($error.message);
				// We're done, return the instance
				return this;
			}
			// We're done
		} catch ($error) {
			// Log the error
			this.logger().error($error.message);
			// Set the result flag
			this.result().unsuccessful();
			// Add the log message
			this.result().log($error.message);
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
				this.logger().error($error.message);
				// Set the result flag
				this.result().unsuccessful();
				// Add the log message
				this.result().log($error.message);
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
		if ($result !== undefined) {
			// Reset the result into the instance
			this.mResult = $result;
		}
		// We're done, return the result from the instance
		return this.mResult;
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End LibraryPowerDNS Class Definition //////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
