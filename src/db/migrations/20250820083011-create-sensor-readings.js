'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sensor_readings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      sensor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sensors', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      value: { type: Sequelize.DECIMAL(10,4), allowNull: false },
      unit: { type: Sequelize.STRING, allowNull: false },
      timestamp: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      is_anomaly: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      anomaly_score: { type: Sequelize.DECIMAL(5,4), allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('sensor_readings', ['sensor_id']);
    await queryInterface.addIndex('sensor_readings', ['timestamp']);
    await queryInterface.addIndex('sensor_readings', ['is_anomaly']);
    await queryInterface.addIndex('sensor_readings', ['sensor_id', 'timestamp']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sensor_readings');
  },
};
