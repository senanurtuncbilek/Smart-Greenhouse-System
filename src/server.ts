// listen server
import app from "./app";
import db from "./db/sequelize";
import config from "./config";
import './db/models';

async function startServer() {
  try {
    await db.authenticate();
    console.log(" Database connection successful");

    await db.sync({ alter: true });
    console.log("Tables syncing");

    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Server couldn't start:", error);
    process.exit(1);
  }


}

startServer();
