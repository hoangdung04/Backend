import sequelize from "./config/database.js";
import { QueryTypes } from "sequelize";

async function main() {
  try {
    const tour = await sequelize.query("SELECT id, title, title_no_accent, information, schedule FROM tours WHERE id = 37", {
      type: QueryTypes.SELECT
    });
    console.log("Tour 37 details:");
    console.log(JSON.stringify(tour, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    process.exit(0);
  }
}

main();
