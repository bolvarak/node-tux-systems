///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $utility = require('../../../Common/Utility'); /// Utility Module //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($sequelize, $type) => { /// DNS Query Lookup Fluent Model Module Definition ////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Define our new model
	const $dnsQueryModel = $sequelize.define('dnsQuery', {
		'domainId': {
			'allowNull': true,
			'field': 'dns_domain_id',
			'type': $type.UUID
		},
		'id': {
			'allowNull': false,
			'defaultValue': $type.UUIDV4,
			'field': 'id',
			'primaryKey': true,
			'type': $type.UUID
		},
		'method': {
			'allowNull': false,
			'field': 'method',
			'type': $type.ENUM(
				'aborttransaction',
				'activatedomainkey',
				'adddomainkey',
				'calculatesoaserial',
				'committransaction',
				'createslavedomain',
				'deactivatedomainkey',
				'directbackendcmd',
				'feedents',
				'feedents3',
				'feedrecord',
				'getalldomainmetadata',
				'getalldomains',
				'getbeforeandafternamesabsolute',
				'getdomaininfo',
				'getdomainkeys',
				'getdomainmetadata',
				'gettsigkey',
				'initialize',
				'ismaster',
				'list',
				'lookup',
				'removedomainkey',
				'replacerrset',
				'searchrecords',
				'setdomainmetadata',
				'setnotified',
				'starttransaction',
				'supermasterbackend'
			)
		},
		'recordId': {
			'allowNull': true,
			'field': 'dns_record_id',
			'type': $type.ARRAY($type.UUID)
		},
		'request': {
			'allowNull': false,
			'field': 'request',
			'type': $type.JSONB
		},
		'response': {
			'allowNull': true,
			'field': 'response',
			'type': $type.JSONB
		},
		'userId': {
			'allowNull': true,
			'field': 'user_id',
			'type': $type.UUID
		}
	}, {
		'hooks': {
			'beforeCreate': ($query, $options) => {
				// Lower-case the method
				$query.method = $query.method.toLowerCase();
			},
			'beforeUpdate': ($query, $options) => {
				// Lower-case the method
				$query.method = $query.method.toLowerCase();
			}
		},
		'indexes': [
			{'fields': ['dns_domain_id']},
			{'fields': ['method']},
			{'fields': ['dns_record_id']},
			{'fields': ['request'], operator: 'jsonb_path_ops', using: 'gin'},
			{'fields': ['user_id']}
		],
		'tableName': 'dns_query'
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Association Builder //////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method provides the associations for this model
	 * @name Sequelize.Model.dnsDomain
	 * @param {Object.<string, Sequelize.Model>} $models
	 * @returns {void}
	 */
	$dnsQueryModel.associate = ($models) => {
		// Associate the user
		$models.dnsQuery.belongsTo($models.user, {
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the domain
		$models.dnsQuery.belongsTo($models.dnsDomain, {
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the queries
		$models.dnsQuery.hasMany($models.dnsRecord, {
			'as': 'domainRecordList',
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	return $dnsQueryModel; /// DNS Query Lookup Fluent Model Definition //////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End DNS Query Lookup Fluent Model Module Definition ///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
