'use strict';

const { last } = require('rxjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      fullname: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: Sequelize.name
      },

      ascii_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      password_hash: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(500),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: Sequelize.phone
      },
      gender: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false,
      },
      is_root: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        require: true,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      failed_login_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_failed_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      locked_until: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        require: true,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        allowNull: false,
        require: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      created_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.STRING,
      },
      updated_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.STRING,
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
      deleted_by: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.STRING,
      },
    });
     await queryInterface.addIndex('users', ['ascii_name'], {
      unique: true,
      name: 'idx_users_ascii_name',
    });
    await queryInterface.addIndex('users', ['phone'], {
      unique: true,
      name: 'idx_users_phone',
      include: ['avatar', 'age', 'gender', 'email', 'is_root', 'is_active', 'created_at', 'updated_at', 'created_by', 'created_by']
    });
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'idx_users_email',
      include: ['name', 'avatar', 'age', 'gender', 'phone', 'is_root', 'is_active', 'created_at', 'updated_at', 'created_by', 'created_by']
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
