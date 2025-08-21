'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    const password = 'Admin123!' // istersen process.env.ADMIN_PASS kullan
    const hash = await bcrypt.hash(password, 10);

    // aynı email varsa ekleme
    const [users] = await queryInterface.sequelize.query(
      `SELECT _id, email FROM users WHERE email = 'admin@example.com';`
    );
    if (users.length) return;

    await queryInterface.bulkInsert('users', [{
      email: 'admin@example.com',
      password: hash,
      first_name: 'System',
      last_name: 'Admin',
      phone_number: null,
      is_active: true,
      created_at: now,
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' });
  }
};
