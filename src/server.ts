// listen server
import app from "./app";
import db from "./db/sequelize";
import config from "./config";
import "./db/models";

async function startServer() {
  try {
    await db.authenticate();
    console.log(" Database connection successful");
    if (process.env.DB_SYNC_ALTER === "true") {
      await db.sync({ alter: true });
      console.log("Tables syncing (alter)");
    } else {
      console.log("Skipping Sequelize sync; use migrations via sequelize-cli");
    }

    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Server couldn't start:", error);
    process.exit(1);
  }

  console.log(
    "DB:",
    process.env.DB_HOST,
    process.env.DB_NAME,
    process.env.DB_USER
  );
}

startServer();
