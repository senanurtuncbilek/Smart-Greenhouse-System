'use strict';

const PRIVS = [
  'user_view','user_add','user_update','user_delete',
  'role_view','role_add','role_update','role_delete',
  'greenhouse_view','greenhouse_add','greenhouse_update','greenhouse_delete',
  'zone_view','zone_add','zone_update','zone_delete',
  'sensor_view','sensor_add','sensor_update','sensor_delete',
];

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    // admin rol id'sini çek
    const [roles] = await queryInterface.sequelize.query(`SELECT id, name FROM roles;`);
    const admin = roles.find(r => r.name === 'admin');
    if (!admin) throw new Error('admin role not found');

    // admin'e tüm izinleri ver
    await queryInterface.bulkInsert('role_privileges',
      PRIVS.map(p => ({
        role_id: admin.id,
        permission: p,
        created_at: now,
        updated_at: now
      }))
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_privileges', null, {});
  }
};
