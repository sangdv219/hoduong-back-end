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
      other_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
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
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: Sequelize.phone
      },
      gender: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[0, 1]] // 1: Nữ, 0: Nam
        } 
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false,
      },

      life_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[0, 1]] // Chỉ chấp nhận giá trị nằm trong mảng này
        } 
      },
      biography: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      burial_place: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      year_of_death: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_root: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      status: {
        type: Sequelize.STRING(10),
        allowNull: false,
        validate: {
          isIn: [['active', 'inactive', 'pending', 'suspended', 'archived']] // Chỉ chấp nhận giá trị nằm trong mảng này
        },
// PENDING: Mới đăng ký, chưa verify email/chờ Admin duyệt.
// ACTIVE: Đang hoạt động bình thường.
// INACTIVE: Người dùng tự tắt tài khoản / chưa kích hoạt xong.
// SUSPENDED: Bị Admin khóa / vi phạm tiêu chuẩn.
// ARCHIVED: Đã xóa mềm / Đưa vào lưu trữ.
        defaultValue: 'pending' 
      },
      avatar_file_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
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
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
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
    });
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'idx_users_email',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
