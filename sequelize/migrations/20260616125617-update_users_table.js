'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Sử dụng transaction để đảm bảo tính nguyên tử (Atomicity) - Toàn bộ thành công hoặc toàn bộ thất bại
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('users', 'other_name', {
        type: Sequelize.STRING(500),
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'year_of_birth', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'year_of_death', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'burial_place', {
        type: Sequelize.STRING(1000),
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'address', {
        type: Sequelize.STRING(1000),
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'biography', {
        type: Sequelize.TEXT,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.STRING(100),
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('users', 'avatar_file_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      // Cam kết lưu lại tất cả thay đổi khi không xảy ra lỗi
      await transaction.commit();
    } catch (error) {
      // Rollback lại toàn bộ nếu có bất kỳ lỗi nào xảy ra trong quá trình chạy
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Xóa các cột theo thứ tự ngược lại khi hạ cấp phiên bản DB
      await queryInterface.removeColumn('users', 'avatar_file_id', { transaction });
      await queryInterface.removeColumn('users', 'status', { transaction });
      await queryInterface.removeColumn('users', 'biography', { transaction });
      await queryInterface.removeColumn('users', 'address', { transaction });
      await queryInterface.removeColumn('users', 'burial_place', { transaction });
      await queryInterface.removeColumn('users', 'year_of_death', { transaction });
      await queryInterface.removeColumn('users', 'year_of_birth', { transaction });
      await queryInterface.removeColumn('users', 'other_name', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};