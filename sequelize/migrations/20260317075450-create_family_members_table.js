'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('family_members', {
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
      relation_type: {
        type: Sequelize.STRING(10),
        allowNull: false,
        validate: {
          isIn: [['blood', 'married']] // Chỉ chấp nhận giá trị nằm trong mảng này
        },
        defaultValue: 'blood'
      },
      parent_couple_id: {
        type: Sequelize.UUID,
        allowNull:true,
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

    await queryInterface.addIndex('family_members', ['parent_couple_id'], {
      name: 'idx_family_members_father_id',
    });
    await queryInterface.addIndex('family_members', ['user_id'], {
      name: 'idx_family_members_user_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('family_members');
  },
};
