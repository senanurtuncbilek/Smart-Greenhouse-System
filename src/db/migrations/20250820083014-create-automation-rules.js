'use strict';

const RULE_STATUS = 'enum_automation_rules_status';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ENUM status type
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${RULE_STATUS}') THEN
          CREATE TYPE ${RULE_STATUS} AS ENUM ('active','inactive','testing');
        END IF;
      END$$;
    `);

    await queryInterface.createTable('automation_rules', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      zone_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'zones', key: '_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: { type: RULE_STATUS, allowNull: false, defaultValue: 'active' },
      priority: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 }, // LOW=1..CRITICAL=4
      conditions: { type: Sequelize.JSONB, allowNull: false },
      actions: { type: Sequelize.JSONB, allowNull: false },
      active_hours_start: { type: Sequelize.STRING(5), allowNull: true }, // 'HH:MM'
      active_hours_end: { type: Sequelize.STRING(5), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: '_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('automation_rules', ['zone_id']);
    await queryInterface.addIndex('automation_rules', ['status']);
    await queryInterface.addIndex('automation_rules', ['priority']);
    await queryInterface.addIndex('automation_rules', ['is_active']);
    await queryInterface.addIndex('automation_rules', ['created_by']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('automation_rules');
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${RULE_STATUS}') THEN
          DROP TYPE ${RULE_STATUS};
        END IF;
      END$$;
    `);
  },
};
