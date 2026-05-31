'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nodes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_UUID()'),
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // bảng users
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      members: {
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue: 1
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull:true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue: false
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

    await queryInterface.addIndex('nodes', ['parent_id'], {
      unique: true,
      name: 'idx_nodes_parent_id',
    });
    await queryInterface.addIndex('nodes', ['user_id'], {
      unique: true,
      name: 'idx_nodes_user_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nodes');
  },
};
