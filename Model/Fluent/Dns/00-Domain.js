///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($sequelize, $type) => { /// DNS Domain Lookup Fluent Model Module Definition ///////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Define our new model
	const $dnsDomainModel = $sequelize.define('dnsDomain', {
		'expire': {
			'allowNull': false,
			'defaultValue': 604800,
			'field': 'expire',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
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
		'isPublic': {
			'allowNull': true,
			'defaultValue': false,
			'field': 'is_public',
			'type': $type.BOOLEAN
		},
		'name': {
			'allowNull': true,
			'field': 'name',
			'type': $type.TEXT
		},
		'nameServer': {
			'allowNull': false,
			'field': 'name_server',
			'type': $type.ARRAY($type.TEXT)
		},
		'refresh': {
			'allowNull': false,
			'defaultValue': 10800,
			'field': 'refresh',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		},
		'retry': {
			'allowNull': false,
			'defaultValue': 3600,
			'field': 'retry',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		},
		'serial': {
			'allowNull': true,
			'defaultValue': $sequelize.literal('EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)'),
			'field': 'serial',
			'type': $type.INTEGER
		},
		'ttl': {
			'allowNull': false,
			'defaultValue': 1800,
			'field': 'ttl',
			'type': $type.INTEGER,
			'validate': {
				'isInt': true
			}
		},
		'userId': {
			'allowNull': false,
			'field': 'user_id',
			'type': $type.UUID
		}
	}, {
		'hooks': {
			'beforeCreate': ($domain, $options) => {
				// Reset the name
				$domain.name = $domain.name.toLowerCase();
				// Iterate over the nameservers
				for (let $index = 0; $index < $domain.nameServer.length; ++$index) {
					// Reset the nameserver
					$domain.nameServer[$index] = $domain.nameServer[$index].toLowerCase();
				}
			},
			'beforeUpdate': ($domain, $options) => {
				// Reset the name
				$domain.name = $domain.name.toLowerCase();
				// Iterate over the nameservers
				for (let $index = 0; $index < $domain.nameServer.length; ++$index) {
					// Reset the nameserver
					$domain.nameServer[$index] = $domain.nameServer[$index].toLowerCase();
				}
			}
		},
		'indexes': [
			{'fields': ['is_active']},
			{'fields': ['is_public']},
			{'fields': ['name']},
			{'fields': ['name', 'version', 'deleted_at', 'is_active'], 'unique': true},
			{'fields': ['serial']},
			{'fields': ['user_id']}
		],
		'tableName': 'dns_domain'
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
	$dnsDomainModel.associate = ($models) => {
		// Associate the user
		$models.dnsDomain.belongsTo($models.user, {
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the records
		$models.dnsDomain.hasMany($models.dnsRecord, {
			'as': 'domainRecordList',
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the queries
		$models.dnsDomain.hasMany($models.dnsQuery, {
			'as': 'queryList',
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	return $dnsDomainModel; /// DNS Domain Lookup Fluent Model Definition ////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End DNS Domain Lookup Fluent Model Module Definition //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
