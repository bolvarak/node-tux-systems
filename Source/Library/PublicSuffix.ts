///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import $utility from '../Common/Utility'; /// Utility Module /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import $cache from './Cache'; /// Cache Module ///////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import $request from 'request-promise-native'; /// HTTP Request Module ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import DnsDomainTld from '../Model/Fluent/Dns/15-DomainTld'; /// Database Connection /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export default class LibraryPublicSuffix { /// LibraryPublicSuffix Class Definition //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Static Properties ////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This property contains the second-level domain name for the hostname
	 * @name LibraryPublicSuffix.mDomain
	 * @property
	 * @protected
	 * @static
	 * @type {string|null}
	 */
	protected static mDomain: string|null = null;

	/**
	 * This property contains the sub-level host for the hostname
	 * @name LibraryPublicSuffix.mHost
	 * @property
	 * @protected
	 * @static
	 * @type {string|null}
	 */
	protected static mHost: string|null = null;

	/**
	 * This property contains the port for the hostname
	 * @name LibraryPublicSuffix.mPort
	 * @property
	 * @protected
	 * @static
	 * @type {number}
	 */
	protected static mPort:number = 0;

	/**
	 * This property contains the public suffix data in a usable format
	 * @name LibraryPublicSuffix.mPublicSuffixData
	 * @property
	 * @protected
	 * @static
	 * @type {string[]}
	 */
	protected static mPublicSuffixData: string[] = [];

	/**
	 * This property contains the source hostname that was parsed
	 * @name LibraryPublicSuffix.mSource
	 * @property
	 * @protected
	 * @static
	 * @type {string}
	 */
	protected static mSource: string = '';

	/**
	 * This property contains the top level domain (TLD) of the hostname
	 * @name LibraryPublicSuffix.mTopLevelDomain
	 * @property
	 * @protected
	 * @static
	 * @type {string|null}
	 */
	protected static mTopLevelDomain: string|null = null;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Static Protected Methods /////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method sets the port number into the instance from the source
	 * @async
	 * @name LibraryPublicSuffix.processPort()
	 * @protected
	 * @returns {Promise<void>}
	 * @static
	 * @uses LibraryPublicSuffix.port()
	 */
	protected static async processPort(): Promise<void> {
		// Match the port number
		let $matches: RegExpMatchArray|null = this.mSource.match(/:([0-9]+?$)/);
		// Check for matches
		if (!$utility.lodash.isNull($matches) && ($matches.length >= 2)) {
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
	 * @name LibraryPublicSuffix.process()
	 * @protected
	 * @returns {Promise<void>}
	 * @static
	 * @uses LibraryPublicSuffix.source()
	 * @uses LibraryPublicSuffix.database()
	 * @uses LibraryPublicSuffix.tld()
	 * @uses LibraryPublicSuffix.domain()
	 */
	protected static async process(): Promise<void> {
		// Split the domain into parts
		let $parts:string[] = [];
		// Localize the parts
		let $sourceParts: string[] = this.source().replace(':'.concat(this.mPort.toString()), '').trim().split(/\./);
		// Iterate over the parts
		for (let $index: number = 0; $index < $sourceParts.length; ++$index) {
			// Check the part
			if (!$utility.lodash.isEmpty($sourceParts[$index])) {
				// Add the part to the container
				$parts.push($sourceParts[$index]);
			}
			// Delete the source part
			delete $sourceParts[$index];
		}
		// Check for parts
		if (!$parts.length || ($parts.length === 1)) {
			// Set the host
			this.mHost = this.mSource;
			// Set the domain
			this.mDomain = null;
			// Set the TLD
			this.mTopLevelDomain = null;
			// We're done
			return;
		}
		// Set the found flag
		let $found: boolean = false;
		// Set the current working part
		let $workingTld: string = ($parts.pop() as string);
		// Iterate until we have found the TLD
		while (!$found) {
			// Query for the TLD
			let $tld: DnsDomainTld|null = await DnsDomainTld.findOne({
				where: {
					name: {
						[DnsDomainTld.sequelize.Op.eq]: $workingTld.toLowerCase()
					}
				}
			});
			// Iterate over the public suffix data
			if (!$utility.lodash.isNull($tld)) {
				// Reset the found flag
				$found = true;
			} else {
				// Localize the part
				let $part: string = ($parts.pop() as string);
				// Check the part
				if ($utility.lodash.isEmpty($part)) {
					// Set the host
					this.mHost = this.mSource;
					// Set the domain
					this.mDomain = null;
					// Set the TLD
					this.mTopLevelDomain = null;
					// We're done
					return;
				}
				// Update the workding TLD
				$workingTld = $workingTld.concat('.', ($parts.pop() as string));
			}
		}
		// Set the top-level domain into the instance
		this.tld($workingTld);
		// Set the domain into the instance
		this.domain(''.concat(($parts.pop() as string), '.', $workingTld));
		// Set the host name
		this.host($parts.length ? $parts.join('.') : null);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Methods ///////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method downloads the PublicSuffix database and stores it in cache
	 * @async
	 * @name LibraryPublicSuffix.downloadDatabase()
	 * @public
	 * @returns {Promise.<void>}
	 * @static
	 */
	public static async downloadDatabase() {
		// Load the Public Suffix data
		let $response = await $request.get('https://publicsuffix.org/list/public_suffix_list.dat');
		// Define our data
		let $tldList: string[] = [];
		// Split the lines
		let $lines: string[] = $response.split(/\n/);
		// Iterate over the data
		for (let $index: number = 0; $index < $lines.length; ++$index) {
			// Check for an empty line
			if ($utility.lodash.isEmpty($lines[$index].trim())) {
				// Delete the line
				delete $lines[$index];
				// Next iteration please
				continue;
			}
			// Check for a comment
			if ($lines[$index].trim().match(/^(\/\/|#)/)) {
				// Delete the line
				delete $lines[$index];
				// Next iteration please
				continue;
			}
			// Add the TLD to the container
			$tldList.push($lines[$index].trim().replace(/(!|\*\.?)/g, '').toLowerCase());
			// Delete the line
			delete $lines[$index];
		}
		// Write the cache file
		await $cache.write('public.suffix.dat', JSON.stringify($tldList), false);
	}

	/**
	 * This method opens the PublicSuffix database from cache
	 * @async
	 * @name LibraryPublicSuffix.openDatabase()
	 * @public
	 * @returns {Promise.<void>}
	 * @static
	 * @uses LibraryPublicSuffix.downloadDatabase()
	 * @uses LibraryPublicSuffix.openDatabase()
	 */
	public static async openDatabase(): Promise<void> {
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
	 * @public
	 * @returns {Promise.<LibraryPublicSuffix>}
	 * @static
	 * @uses LibraryPublicSuffix.source()
	 * @uses LibraryPublicSuffix.process()
	 * @uses LibraryPublicSuffix.processPort()
	 */
	public static async parse($hostname: string): Promise<LibraryPublicSuffix> {
		// Set the source into the instance
		this.source($hostname);
		// Parse the TLD
		await this.process();
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
	 * @param {string[], optional} $publicSuffixData
	 * @public
	 * @returns {string[]}
	 * @static
	 */
	public static database($publicSuffixData?: string[]): string[] {
		// Check for provided PublicSuffix data
		if ($utility.lodash.isArray($publicSuffixData)) {
			// Reset the PublicSuffix data into the instance
			this.mPublicSuffixData = $publicSuffixData;
		}
		// We're done, return the PublicSuffix data from the instance
		return this.mPublicSuffixData;
	}

	/**
	 * This method returns the domain name from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.domain()
	 * @param {string|null, optional} $domainName
	 * @public
	 * @returns {string|null}
	 * @static
	 */
	public static domain($domainName?: string|null): string|null {
		// Check for a provided domain name
		if ($utility.lodash.isString($domainName)) {
			// Reset the domain name into the instance
			this.mDomain = $domainName;
		}
		// We're done, return the domain name from the instance
		return this.mDomain;
	}

	/**
	 * This method returns the hostname from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.host()
	 * @param {string|null, optional} $hostName
	 * @public
	 * @returns {string|null}
	 * @static
	 */
	public static host($hostName?: string|null): string|null {
		// Check for a provided hostname
		if ($utility.lodash.isString($hostName)) {
			// Reset the hostname into the instance
			this.mHost = $hostName;
		}
		// We're done, return the hostname from the instance
		return this.mHost;
	}

	/**
	 * This method returns the port number from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.port()
	 * @param {number, optional} $port
	 * @public
	 * @returns {number}
	 * @static
	 */
	public static port($port?: number): number {
		// Check for a provided port
		if ($utility.lodash.isNumber($port)) {
			// Reset the port into the instance
			this.mPort = $port;
		}
		// We're done, return the port from the instance
		return this.mPort;
	}

	/**
	 * This method returns the source from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.source()
	 * @param {string, optional} $hostName
	 * @public
	 * @returns {string}
	 * @static
	 */
	public static source($hostName?: string): string {
		// Check for a provided source
		if ($utility.lodash.isString($hostName)) {
			// Reset the source into the instance
			this.mSource = $hostName;
		}
		// We're done, return the source from the instance
		return this.mSource;
	}

	/**
	 * This method returns the top-level domain from the instance with the ability to reset it inline
	 * @name LibraryPublicSuffix.tld()
	 * @param {string|null, optional} $topLevelDomain
	 * @public
	 * @returns {string|null}
	 * @static
	 */
	public static tld($topLevelDomain?: string|null): string|null {
		// Check for a provided top-level domain
		if ($utility.lodash.isString($topLevelDomain)) {
			// Reset the top-level domain into the instance
			this.mTopLevelDomain = $topLevelDomain;
		}
		// We're done, return the top-level domain from the instance
		return this.mTopLevelDomain;
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End LibraryPublicSuffix Class Definition //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
