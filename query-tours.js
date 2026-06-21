import sequelize from "./config/database.js";
import { QueryTypes } from "sequelize";

async function main() {
  try {
    const tours = await sequelize.query("SELECT id, title, slug, stock FROM tours WHERE deleted = false AND status = 'active'", {
      type: QueryTypes.SELECT
    });
    console.log("Active Tours in Database:");
    console.table(tours);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    process.exit(0);
  }
}

main();
