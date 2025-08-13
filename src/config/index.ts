import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT!) || 5432,
  DB_NAME: process.env.DB_NAME || "postgres",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_SSL: process.env.DB_SSL === "true",
  JWT: {
    SECRET: process.env.JWT_SECRET as string,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string
  },
};

export default config;
