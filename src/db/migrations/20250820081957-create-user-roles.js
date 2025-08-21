'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: '_id' }, // users._id
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addIndex('user_roles', ['user_id']);
    await queryInterface.addIndex('user_roles', ['role_id']);

    // Aynı kullanıcıya aynı rolün iki kez verilmesini engelle
    await queryInterface.addConstraint('user_roles', {
      fields: ['user_id', 'role_id'],
      type: 'unique',
      name: 'uq_user_roles_userid_roleid',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roles');
  },
};
