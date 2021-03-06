#!/usr/bin/env node

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $config = require(process.env.TUX_CONFIG); /// Configuration Settings //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $db = require('../Common/Database'); /// Database Connection ///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $utility = require('../Common/Utility'); /// Utility Module ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const CommonServiceHttp = require('../Common/Service/Http'); /// HTTP Module /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = class ServiceHttp extends CommonServiceHttp { /// ServiceHttp Class Definition //////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Constructor //////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method instantiates a new HTTP Service
	 * @name ServiceHttp.constructor()
	 */
	constructor() {

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		super($config.http.port, $config.http.log.id, $config.http.log.level); /// Super Constructor /////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	} /// End Constructor ////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End ServiceHttp Class Definition //////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
