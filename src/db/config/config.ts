// src/db/config/config.ts

import { Dialect } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port?: number;
  dialect: Dialect;
}

interface Config {
  development: DBConfig;
  test: DBConfig;
  production: DBConfig;
}

const config: Config = {
  development: {
    username: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "senin_sifren",
    database: process.env.DB_NAME || "veritabani_adi",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "test_sifre",
    database: "test_db",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "intermediateProject",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
  },
};

// 🔥 İşte burası kritik: CLI'ın çalışması için export ediyoruz!
export default config;
module.exports = config;
