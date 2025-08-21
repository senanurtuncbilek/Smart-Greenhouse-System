'use strict';

const SENSOR_TYPE = 'enum_sensors_type';
const SENSOR_STATUS = 'enum_sensors_status';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ENUM type'ları önceden oluştur
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${SENSOR_TYPE}') THEN
          CREATE TYPE ${SENSOR_TYPE} AS ENUM ('temperature','humidity','soil_moisture','light_level','ph','co2');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${SENSOR_STATUS}') THEN
          CREATE TYPE ${SENSOR_STATUS} AS ENUM ('active','inactive','maintenance','error');
        END IF;
      END$$;
    `);

    await queryInterface.createTable('sensors', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: SENSOR_TYPE, allowNull: false },        // ENUM tip adı
      zone_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'zones', key: '_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: { type: SENSOR_STATUS, allowNull: false, defaultValue: 'active' },
      location: { type: Sequelize.STRING, allowNull: false },
      calibration_date: { type: Sequelize.DATE, allowNull: true },
      last_reading: { type: Sequelize.DATE, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('sensors', ['zone_id']);
    await queryInterface.addIndex('sensors', ['type']);
    await queryInterface.addIndex('sensors', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sensors');
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${SENSOR_TYPE}') THEN
          DROP TYPE ${SENSOR_TYPE};
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${SENSOR_STATUS}') THEN
          DROP TYPE ${SENSOR_STATUS};
        END IF;
      END$$;
    `);
  },
};
