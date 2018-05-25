///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($sequelize, $type) => { /// DNS Domain TLD Lookup Fluent Model Module Definition ///////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Define our new model
	const $domainTldModel = $sequelize.define('dnsDomainTld', {
		'id': {
			'allowNull': false,
			'defaultValue': $type.UUIDV4,
			'field': 'id',
			'primaryKey': true,
			'type': $type.UUID
		},
		'name': {
			'allowNull': false,
			'field': 'name',
			'type': $type.STRING(255)
		}
	}, {
		'hooks': {
			'beforeCreate': ($tld, $options) => {
				// Reset the name
				$tld.name = $tld.name.toLowerCase();
			},
			'beforeUpdate': ($tld, $options) => {
				// Reset the name
				$tld.name = $tld.name.toLowerCase();
			}
		},
		'indexes': [
			{'fields': ['name'], 'unique': true}
		],
		'paranoid': false,
		'tableName': 'dns_domain_tld',
		'timestamps': false,
		'version': false
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	return $domainTldModel; /// DNS Domain TLD Lookup Fluent Model Definition ////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End DNS Domain TLD Lookup Fluent Model Module Definition //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////