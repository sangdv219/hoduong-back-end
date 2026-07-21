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
        allowNull: true,
        references: {
          model: 'users', // bảng users
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      generation_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      father_id: {
        type: Sequelize.UUID,
        allowNull:true,
        references: {
          model: 'nodes', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      mother_id: {
        type: Sequelize.UUID, 
        allowNull: true, 
        references: {
          model: 'nodes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      parent_branch_id:{
        type: Sequelize.UUID, 
        allowNull: true, 
        references: {
          model: 'branches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      child_order: {
        type: Sequelize.INTEGER,
        allowNull:false,
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

    await queryInterface.addIndex('nodes', ['father_id'], {
      unique: true,
      name: 'idx_nodes_father_id',
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
