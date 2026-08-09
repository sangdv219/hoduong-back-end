'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('family_members', {
      fields: ['parent_couple_id'],
      type: 'foreign key',
      name: 'fk_family_members_parent_couple_id', // Tên định danh cho constraint
      references: {
        table: 'couples',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Khi rollback, bắt buộc phải gỡ constraint này đi trước
    await queryInterface.removeConstraint('family_members', 'fk_family_members_parent_couple_id');
  }
};