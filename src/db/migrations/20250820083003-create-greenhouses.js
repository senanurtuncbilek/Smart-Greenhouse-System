'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('greenhouses', {
      _id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: '_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      location: { type: Sequelize.STRING, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    // unique(user_id, name) + index(user_id)
    await queryInterface.addConstraint('greenhouses', {
      fields: ['user_id', 'name'],
      type: 'unique',
      name: 'uniq_user_greenhouse_name',
    });
    await queryInterface.addIndex('greenhouses', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('greenhouses');
  },
};
