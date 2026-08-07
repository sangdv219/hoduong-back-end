'use strict';

const { type } = require("os");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('couples', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_UUID()'),
        allowNull: false,
        primaryKey: true,
      },
      partner_1_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'family_members', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // CẬP NHẬT: Thay family_member_id thành đối tác 2 trỏ về family_members
      partner_2_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'family_members', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      family_member_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'family_members', // bảng node
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      couple_order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1 
      },
      marriage_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      marriage_status: {
        type: Sequelize.ENUM('SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'),
        allowNull: false
      },
      marriage_date_type: {
        type: Sequelize.ENUM('SOLAR', 'LUNAR'),
        allowNull: true,
        defaultValue: 'SOLAR'
      },
      divorce_date: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('couples', ['partner_1_id', 'partner_2_id'], {
      unique: true,
      name: 'idx_couples_partners',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('couples');
    
    // Lưu ý: Tùy thuộc vào version Sequelize, đôi khi cần drop ENUM types thủ công trong hàm down
    // ở PostgreSQL để tránh lỗi "type already exists" nếu chạy lại migration.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_couples_marriage_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_couples_marriage_date_type";');
  },
};
