///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($httpRequest, $httpResponse, $nextCall) => { /// NotFound Module Definition ////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Define our new error
	let $error = new Error('Not Found');
	// Set the status code into the error
	$error.status = 404;
	// Execute the next call in the stack
	$nextCall($error);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End NotFound Module Definition ////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

