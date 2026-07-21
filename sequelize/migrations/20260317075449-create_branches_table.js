'use strict';

const { AllowNull } = require('sequelize-typescript');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('branches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_UUID()'),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      parent_branch_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches', // bảng users
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        allowNull: false,
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
    });
  }, 
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('branches');
  }
};
