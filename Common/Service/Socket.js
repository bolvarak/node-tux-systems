///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $config = require(process.env.TUX_CONFIG); /// Configuration Settings //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $utility = require('../Utility'); /// Utility Module ///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $net = require('net'); /// Network Module //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const CommonService = require('../Service'); /// Service Module //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = class CommonServiceSocket extends CommonService { /// CommonServiceSocket Class Definition //////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Constructor //////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method instantiates a new Socket
	 * @name CommonServiceSocket.constructor()
	 * @param {string} $socketPath
	 * @param {string, optional} $sysLogId ['tux-systems-socket']
	 * @param {string, optional} $logLevel ['debug']
	 */
	constructor($socketPath, $sysLogId = 'tux-systems-socket', $logLevel = 'debug') {

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		super($sysLogId, $logLevel); /// Super Constructor ///////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// Properties ///////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		/**
		 * This property contains a map of connected clients
		 * @name CommonServiceSocket.mClients
		 * @type {Object.<string, Socket>}
		 */
		this.mClients = {};

		/**
		 * This property contains the listening server
		 * @name CommonServiceSocket.mServer
		 * @type {Server}
		 */
		this.mServer = {};

		/**
		 * This property contains the shutdown flag
		 * @name CommonServiceSocket.mShutdown
		 * @type {boolean}
		 */
		this.mShutdown = false;

		/**
		 * This property contains the socket path in which the server listens
		 * @name CommonServiceSocket.mSocket
		 * @type {string}
		 */
		this.mSocket = $socketPath;

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// Construction /////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

		// Attach to the SIGIN signal
		process.on('SIGINT', async () => {
			// Cleanup the connections and shut the server down
			await this.cleanUp();
		});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	} /// End Constructor ////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Abstract Methods /////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method responds to an incoming connection
	 * @abstract
	 * @async
	 * @name CommonServiceSocket.clientConnect()
	 * @param {Socket} $stream
	 * @returns {Promise<void>}
	 */
	async clientConnect($stream) {
		// This method does nothing by default
	}

	/**
	 * This method handles a client disconnecting
	 * @abstract
	 * @async
	 * @name CommonServiceSocket.clientDisconnect()
	 * @param {string} $clientId
	 * @param {Socket} $stream
	 * @returns {Promise<void>}
	 */
	async clientDisconnect($clientId, $stream) {
		// This method does nothing by default
	}

	/**
	 * This method forces a client to disconnect
	 * @abstract
	 * @async
	 * @name CommonServiceSocket.clientForceDisconnect()
	 * @param {string} $clientId
	 * @param {Socket} $stream
	 * @returns {Promise<void>}
	 */
	async clientForceDisconnect($clientId, $stream) {
		// This method does nothing by default
	}

	/**
	 * This method handles the client request
	 * @abstract
	 * @async
	 * @name CommonServiceSocket.clientRequest()
	 * @param {string} $clientId
	 * @param {Socket} $stream
	 * @param {Buffer} $payload
	 * @returns {Promise<void>}
	 */
	async clientRequest($clientId, $stream, $payload) {
		// This method does nothing by default
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method cleans up the clients and stops the server
	 * @async
	 * @name CommonServiceSocket.cleanUp()
	 * @returns {Promise<void>}
	 * @uses CommonService.logger()
	 * @uses CommonServiceSocket.clientForceDisconnect()
	 * @uses CommonServiceSocket.stop()
	 */
	async cleanUp() {
		// Check the shutdown flag
		if (!this.mShutdown) {
			// Reset the shutdown flag
			this.mShutdown = true;
			// Log the message
			this.logger().info('Cleaning Up Clients');
			// Localize the client IDs
			let $clientList = Object.keys(this.mClients);
			// Iterate over the client IDs
			while ($clientList.length) {
				// Reomove and localize the client ID
				let $clientId = $clientList.pop();
				// Emit the event
				await this.clientForceDisconnect($clientId, this.mClients[$clientId]);
				// Log the message
				this.logger().info($utility.util.format('Forcing Client [%s] Disconnect', $clientId));
				// Close the client
				this.mClients[$clientId].end();
			}
			// Close the server
			await this.stop();
		}
	}

	/**
	 * This method sets up a client and binds to its events
	 * @async
	 * @name CommonServiceSocket.clientSetup()
	 * @param {Socket} $stream
	 * @returns {Promise<void>}
	 * @uses CommonService.logger()
	 * @uses CommonServiceSocket.clientDisconnect()
	 * @uses CommonServiceSocket.clientRequest()
	 */
	async clientSetup($stream) {
		// Define the client ID
		let $clientId = $utility.uuid();
		// Log the message
		this.logger().info($utility.util.format('Client [%s] Locked', $clientId));
		// Set the client into the pool
		this.mClients[$clientId] = ($stream);
		// Bind to the disconnect event
		$stream.on('end', async () => {
			// Process the client disconnect
			await this.clientDisconnect($clientId, $stream);
			// Log the message
			this.logger().info($utility.util.format('Client [%s] Disconnected', $clientId));
			// Purge the client from the pool
			delete this.mClients[$clientId];
		});
		// Bind to the data event
		$stream.on('data', async ($payload) => {
			// Localize the payload
			let $data = $payload.toString().trim().toLowerCase();
			// Check for a killswitch
			if ($data === '\\q') {
				// We're done, kill the connection
				return $stream.end();
			} else if ($data === '\\c') {
				console.log('Clients', this.mClients);
				// Send the client list to this client
				$stream.write(JSON.stringify(this.mClients).concat('\n'));
			} else {
				// Delete the localized data
				$data = undefined;
				// Process the client request
				await this.clientRequest($clientId, $stream, $payload);
			}
		});
		// Log the message
		this.logger().info($utility.util.format('Client [%s] Loaded', $clientId));
	}

	/**
	 * This method executes pre-flight checks to ensure a clean operating environment
	 * @async
	 * @name CommonServiceSocket.preFlight()
	 * @returns {Promise<void>}
	 * @uses CommonService.logger()
	 */
	async preFlight() {
		// Log the message
		this.logger().info('Running Pre-Flight Checks');
		// Try to stat the socket file
		try {
			// Stat the socket file
			let $stats = await $utility.fsStat(this.mSocket);
			// Log the message
			this.logger().info('Socket Artifact Found');
			// Try to purge the socket file
			try {
				// Log the message
				this.logger().info('Purging Socket Artifact');
				// Purge the socket file
				await $utility.fsDeleteFile(this.mSocket);
			} catch ($error) {
				// Log the error
				this.logger().error($error);
				// We're done, kill the process
				process.exit(1);
			}
		} catch ($error) {
			// Log the message
			this.logger().info('Socket Artifact Not Found');
		}
		// Log the message
		this.logger().info('Pre-Flight Checks Finished');
	}

	/**
	 * This method starts the server
	 * @async
	 * @name CommonServiceSocket.start()
	 * @returns {Promise<void>}
	 * @uses CommonService.logger()
	 * @uses CommonServiceSocket.preFlight()
	 * @uses CommonServiceSocket.clientSetup()
	 * @uses CommonServiceSocket.clientConnect()
	 */
	async start() {
		// Try to start the server
		try {
			// Await the pre-flight checks
			await this.preFlight();
			// Instantiate the server
			this.mServer = $net.createServer(async ($stream) => {
				// Execute the client setup
				await this.clientSetup($stream);
			});
			// Log the message
			this.logger().info('Starting Server');
			// Start the server
			this.mServer.listen(this.mSocket);
			// Attach to the connection event
			this.mServer.on('connection', this.clientConnect);
		} catch ($error) {
			// Log the error
			this.logger().error($error);
			// We're done, kill the process
			process.exit(1);
		}
	}

	/**
	 * This method shuts down the server
	 * @async
	 * @name CommonServiceSocket.shutdownServer()
	 * @returns {Promise<void>}
	 * @uses CommonService.logger()
	 */
	async stop() {
		// Log the message
		this.logger().info('Stopping Server');
		// Close the server
		this.mServer.close();
		// We're done, kill the process
		process.exit(0);
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End CommonServiceSocket Class Definition //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
