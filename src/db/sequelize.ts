import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import config from '../config';


const sequelize = new Sequelize({
  dialect: PostgresDialect,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: Number(config.DB_PORT) || 5432,
  ssl: config.DB_SSL,
  clientMinMessages: process.env.LOG_LEVEL || 'notice',
  logging: console.log,
});

export default sequelize;
