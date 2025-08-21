'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const [[adminUser]] = await queryInterface.sequelize.query(
      `SELECT _id FROM users WHERE email='admin@example.com';`
    );
    const [[adminRole]] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name='admin';`
    );
    if (!adminUser || !adminRole) throw new Error('admin user/role not found');

    // varsa tekrar ekleme
    const [link] = await queryInterface.sequelize.query(
      `SELECT * FROM user_roles WHERE user_id=${adminUser._id} AND role_id=${adminRole.id};`
    );
    if (link.length) return;

    await queryInterface.bulkInsert('user_roles', [{
      user_id: adminUser._id,
      role_id: adminRole.id
    }]);
  },

  async down (queryInterface, Sequelize) {
    const [[adminUser]] = await queryInterface.sequelize.query(
      `SELECT _id FROM users WHERE email='admin@example.com';`
    );
    const [[adminRole]] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name='admin';`
    );
    if (!adminUser || !adminRole) return;
    await queryInterface.bulkDelete('user_roles', { user_id: adminUser._id, role_id: adminRole.id });
  }
};
