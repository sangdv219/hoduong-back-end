'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('couples', {
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
      node_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'nodes', // bảng node
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      couple_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      marriage_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      divorce_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('couples', ['node_id'], {
      unique: true,
      name: 'idx_couples_node_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('couples');
  },
};
