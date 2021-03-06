///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
process.env.TUX_ENVIRONMENT = (process.env.TUX_ENVIRONMENT || 'devel'); /// Environment Definition ///////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import PowerDNS from '../Service/PowerDNS'; /// PowerDNS Service Module //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(async (): Promise<void> => { /// Main Event Loop ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Instantiate our server
	let $powerDns = new PowerDNS();
	// Start the service
	$powerDns.start();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
})(); /// End Main Event Loop ////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
