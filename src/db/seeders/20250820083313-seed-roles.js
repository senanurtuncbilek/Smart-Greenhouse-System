'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { name: 'admin', is_active: true, created_at: now },
      { name: 'operator', is_active: true, created_at: now },
      { name: 'viewer', is_active: true, created_at: now },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', { name: ['admin','operator','viewer'] });
  }
};
