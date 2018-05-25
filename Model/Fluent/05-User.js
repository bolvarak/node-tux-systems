///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
'use strict'; /// Strict Syntax //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const $crypt = require('../../Library/Cryptography'); /// Cryptographic Library Module ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = ($sequelize, $type) => { /// User Lookup Fluent Model Module Definition /////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Define our new model
	const $userModel = $sequelize.define('user', {
		'accountId': {
			'allowNull': false,
			'field': 'account_id',
			'type': $type.UUID
		},
		'emailAddress': {
			'allowNull': false,
			'field': 'email_address',
			'type': $type.STRING,
			'validate': {
				'isEmail': true
			}
		},
		'firstName': {
			'allowNull': false,
			'field': 'first_name',
			'type': $type.STRING,
			'validate': {
				'isAlpha': true,
				'max': 150
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
		'isAdmin': {
			'allowNull': true,
			'defaultValue': false,
			'field': 'is_admin',
			'type': $type.BOOLEAN
		},
		'isPrimary': {
			'allowNull': true,
			'defaultValue': false,
			'field': 'is_primary',
			'type': $type.BOOLEAN
		},
		'lastName': {
			'allowNull': false,
			'field': 'last_name',
			'type': $type.STRING,
			'validate': {
				'isAlpha': true,
				'max': 150
			}
		},
		'password': {
			'allowNull': true,
			'field': 'password',
			'type': $type.TEXT
		},
		'username': {
			'allowNull': false,
			'field': 'username',
			'type': $type.STRING,
			'validate': {
				'isAlphanumeric': true,
				'max': 125
			}
		}
	}, {
		'hooks': {
			'afterCreate': ($user, $options) => {
				// Check for a hash
				if ($crypt.isHash($user.password)) {
					// Decrypt the password
					$user.password = $crypt.secretDecrypt($user.password);
				}
			},
			'afterFind': ($user, $options) => {
				// Check for a hash
				if ($crypt.isHash($user.password)) {
					// Decrypt the password
					$user.password = $crypt.secretDecrypt($user.password);
				}
			},
			'afterUpdate': ($user, $options) => {
				// Check for a hash
				if ($crypt.isHash($user.password)) {
					// Decrypt the password
					$user.password = $crypt.secretDecrypt($user.password);
				}
			},
			'beforeCreate': ($user, $options) => {
				// Check for a hash
				if (!$crypt.isHash($user.password)) {
					// Encrypt the password
					$user.password = $crypt.secretEncrypt($user.password);
				}
			},
			'beforeUpdate': ($user, $options) => {
				// Check for a hash
				if (!$crypt.isHash($user.password)) {
					// Encrypt the password
					$user.password = $crypt.secretEncrypt($user.password);
				}
			}
		},
		'indexes': [
			{'fields': ['account_id']},
			{'fields': ['email_address']},
			{'fields': ['is_active']},
			{'fields': ['is_admin']},
			{'fields': ['is_primary']},
			{'fields': ['username']}
		],
		'tableName': 'user'
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/// Association Builder //////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * This method provides the associations for this model
	 * @name Sequelize.Model.user
	 * @param {Object.<string, Sequelize.Model>} $models
	 * @returns {void}
	 */
	$userModel.associate = ($models) => {
		// Associate the account
		$models.user.belongsTo($models.account, {
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the social media profiles
		$models.user.hasMany($models.socialMediaProfile, {
			'as': 'socialMediaProfileList',
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the domains
		$models.user.hasMany($models.dnsDomain, {
			'as': 'domainList',
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the domain records
		$models.user.hasMany($models.dnsRecord, {
			'as': 'domainRecordList',
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
		// Associate the queries
		$models.user.hasMany($models.dnsQuery, {
			'as': 'queryList',
			'onDelete': 'CASCADE',
			'foreignKey': {
				'allowNull': true
			}
		});
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	return $userModel; /// User Lookup Fluent Model Definition ///////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}; /// End User Lookup Fluent Model Module Definition ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
