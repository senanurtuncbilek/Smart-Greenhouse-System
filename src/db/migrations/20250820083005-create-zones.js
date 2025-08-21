'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('zones', {
      _id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      greenhouse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'greenhouses', key: '_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addIndex('zones', ['greenhouse_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('zones');
  },
};
