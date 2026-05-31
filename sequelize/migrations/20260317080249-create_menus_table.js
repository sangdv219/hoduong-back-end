'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menus', {
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
      ascii_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sort: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      link: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('menus', ['ascii_name'], {
      unique: true,
      name: 'idx_menus_ascii_name',
      include: ['name', 'link', 'sort', 'level', 'parent_id', 'is_active', 'created_at', 'updated_at', 'created_by', 'created_by']
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menus');
  },
};
