///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($sequelize, $type) => { /// DNS Record Lookup Fluent Model Module Definition ///////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Define our new model
	const $dnsRecordModel = $sequelize.define('dnsRecord', {
		'domainId': {
			'allowNull': false,
			'field': 'dns_domain_id',
			'type': $type.UUID
		},
		'flag': {
			'allowNull': true,
			'field': 'flag',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		},
		'host': {
			'allowNull': true,
			'defaultValue': '@',
			'field': 'host',
			'type': $type.TEXT
		},
		'id': {
			'allowNull': false,
			'defaultValue': $type.UUIDV4,
			'field': 'id',
			'primaryKey': true,
			'type': $type.UUID
		},
		'isActive': {
			'allowNull': true,
			'defaultValue': true,
			'field': 'is_active',
			'type': $type.BOOLEAN
		},
		'isDynamic': {
			'allowNull': true,
			'defaultValue': false,
			'field': 'is_dynamic',
			'type': $type.BOOLEAN
		},
		'isSystem': {
			'allowNull': false,
			'defaultValue': false,
			'field': 'is_system_record',
			'type': $type.BOOLEAN
		}
		'port': {
			'allowNull': true,
			'field': 'port',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		},
		'priority': {
			'allowNull': true,
			'field': 'priority',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		},
		'tag': {
			'allowNull': true,
			'field': 'tag',
			'type': $type.ENUM(
				'iodef',
				'issue',
				'issuewild'
			)
		},
		'target': {
			'allowNull': true,
			'field': 'target',
			'type': $type.TEXT
		},
		'ttl': {
			'allowNull': false,
			'defaultValue': 3600,
			'field': 'ttl',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		},
		'type': {
			'allowNull': false,
			'field': 'type',
			'type': $type.ENUM(
				'A',
				'AAAA',
				'CAA',
				'CNAME',
				'DNSSEC',
				'MX',
				'NS',
				'SRV',
				'TXT'
			)
		},
		'userId': {
			'allowNull': false,
			'field': 'user_id',
			'type': $type.UUID
		},
		'weight': {
			'allowNull': true,
			'field': 'weight',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		}
	}, {
		'hooks': {
			'beforeCreate': ($record, $options) => {
				// Reset the host
				$record.host = $record.host.toLowerCase();
			},
			'beforeUpdate': ($record, $options) => {
				// Reset the host
				$record.host = $record.host.toLowerCase();
			}
		},
		'indexes': [
			{'fields': ['dns_domain_id']},
			{'fields': ['host']},
			{'fields': ['is_active']},
			{'fields': ['is_dynamic']},
			{'fields': ['type']},
			{'fields': ['user_id']}
		],
		'tableName': 'dns_record'
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Association Builder //////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method provides the associations for this model
	 * @name Sequelize.Model.dnsRecord
	 * @param {Object.<string, Sequelize.Model>} $models
	 * @returns {void}
	 */
	$dnsRecordModel.associate = ($models) => {
		// Associate the user
		$models.dnsRecord.belongsTo($models.user, {
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the domain
		$models.dnsRecord.belongsTo($models.dnsDomain, {
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	return $dnsRecordModel; /// DNS Record Lookup Fluent Model Definition ////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End DNS Record Lookup Fluent Model Module Definition //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
