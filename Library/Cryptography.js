///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Module Dependencies //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $config = require(process.env.TUX_CONFIG); /// Configuration Settings //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $lodash = require('lodash'); /// Lodash Utility Module /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $fileSystem = require('fs'); /// File-System Module ////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $crypto = require('crypto'); /// Cryptography Module ///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $util = require('util'); /// Utility Module ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = class LibraryCryptography { /// LibraryCryptography Class Definition ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Private Methods //////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method loads a key from the file system, or cleans a raw key
	 * @name LibraryCryptography._key()
	 * @param {string} $key
	 * @param {boolean, optional} $trim [false]
	 * @returns {string}
	 * @static
	 * @private
	 */
	static _key($key, $trim = false) {
		// Check for a file
		if ($key.substr(0, 7).toLowerCase() === 'file://') {
			// Replace the file notation
			$key = $fileSystem.readFileSync($key.substrReplace('', 0, 7));
		}
		// We're done, return the string
		return ($trim ? $key.replace(/(-----(BEGIN|END)(.*?)KEY-----)/mi, '').trim() : $key);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Private Key Methods //////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	static privateKeyDecrypt($hash, $key = '') {

	}


	static privateKeyEncrypt($data, $key = '') {

	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Public Key Methods ///////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	static publicKeyDecrypt($hash, $key = '') {

	}


	static publicKeyEncrypt($data, $key = '') {

	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Secret Key Methods ///////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This function decrypts an encrypted hash
	 * @name LibraryCryptography.secretDecrypt()
	 * @param {string} $hash
	 * @returns {string}
	 * @static
	 */
	static secretDecrypt($hash) {
		// Grab the encryption data
		let $matches = $hash.match(/^{(.*?)}\$([0-9]+)\$([0-9]+)\$(.*?)$/i);
		// Make sure we have matches
		if ($matches.length !== 5) {
			// We're done
			throw new Error('Invalid Hash');
		}
		// Localize the algorithm
		let $algorithm = $matches[1].toLowerCase();
		// Localize the IV length
		let $ivLength = parseInt($matches[2]);
		// Localize our passes
		let $passes = parseInt($matches[3]);
		// Define our text
		let $text = $matches[4];
		// Iterate to the passes
		for (let $pass = 0; $pass < $passes; ++$pass) {
			// Localize our initialization vector
			let $iv = Buffer.from($text.substr(0, ($ivLength * 2)), 'hex');
			// Define our decryption
			let $decipher = $crypto.createDecipheriv($algorithm, this.secret(), $iv);
			// Define our decrypted data
			let $textPartial = Buffer.concat([
				$decipher.update(Buffer.from($text.substr($ivLength * 2), 'base64'), 'base64'),
				$decipher.final()
			]);
			// Reset the text
			$text = $textPartial.toString();
		}
		// We're done, send the response
		return $text;

	}

	/**
	 * This function encrypts a text string
	 * @name LibraryCryptography.secretEncrypt()
	 * @param {string} $text
	 * @param {number, optional} $passes [false]
	 * @returns {string}
	 * @static
	 */
	static secretEncrypt($text, $passes = false) {
		// Define our hash
		let $hash = $text;
		// Check for passes
		if (!$passes) {
			// Reset the passes
			$passes = this.passes();
		}
		// Iterate to the pass
		for (let $pass = 0; $pass < $passes; ++$pass) {
			// Define our IV
			let $iv = $crypto.randomBytes(16);
			// Define our encryption
			let $cipher = $crypto.createCipheriv(this.algorithm(), this.secret(), $iv);
			// Encrypt our data
			let $hashPartial = Buffer.concat([
				$cipher.update(Buffer.from($hash), 'base64'),
				$cipher.final()
			]);
			// Append the hash partial
			$hash = $util.format('%s%s', $iv.toString('hex'), $hashPartial.toString('base64'));
		}
		// We're done, return the final pass
		return $util.format('{%s}$%d$%d$%s', this.algorithm().toUpperCase(), 16, $passes, $hash);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Determinants /////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method determines whether or not a string is a hash that was encrypted by this system or a similar system
	 * @name LibraryCryptography.isHash()
	 * @param {string} $test
	 * @returns {boolean}
	 * @static
	 */
	static isHash($test) {
		// Grab the encryption data
		let $matches = $test.match(/^{(.*?)}\$([0-9]+)\$([0-9]+)\$(.*?)$/i);
		// Make sure we have matches
		if (!$matches || ($matches.length !== 5)) {
			// We're done, not a hash
			return false;
		}
		// We're done, we have a hash
		return true;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Getters //////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method returns the cryptographic algorithm from the configuration
	 * @name LibraryCryptography.algorithm()
	 * @returns {string}
	 * @static
	 */
	static algorithm() {
		// Return the algorithm
		return $config.crypto.algorithm;
	}

	/**
	 * This method returns the cryptographic passes from the configuration
	 * @name LibraryCryptography.passes()
	 * @returns {number}
	 * @static
	 */
	static passes() {
		// Return the passes from the configuration
		return $config.crypto.passes;
	}

	/**
	 * This method returns the private key from the configuration
	 * @name LibraryCryptography.privateKey()
	 * @param {boolean, optional} $trim [false]
	 * @param {string, optional} $key ['']
	 * @returns {string}
	 * @static
	 */
	static privateKey($trim = false, $key = '') {
		// Return the key
		return this._key(($key || $config.crypto.privateKey), $trim);
	}

	/**
	 * This method returns the public key from the configuration
	 * @name LibraryCryptography.publicKey()
	 * @param {boolean, optional} $trim [false]
	 * @param {string, optional} $key ['']
	 * @returns {string}
	 * @static
	 */
	static publicKey($trim = false, $key = '') {
		// Return the key
		return this._key(($key || $config.crypto.publicKey), $trim);
	}

	/**
	 * This method returns the cryptographic secret from the configuration used for arbitrary encryption and decryption
	 * @name LibraryCryptography.secret()
	 * @returns {string}
	 * @static
	 */
	static secret() {
		// Return the secret
		return $config.crypto.secret;
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End LibraryCryptography Class Definition //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
