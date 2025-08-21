'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_privileges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      permission: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: '_id' }, // users._id
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('role_privileges', ['role_id']);
    await queryInterface.addIndex('role_privileges', ['created_by']);

    // Aynı role'a aynı iznin iki kez eklenmesini engelle (güçlü öneri)
    await queryInterface.addConstraint('role_privileges', {
      fields: ['role_id', 'permission'],
      type: 'unique',
      name: 'uq_role_privilege_roleid_permission',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_privileges');
  },
};
