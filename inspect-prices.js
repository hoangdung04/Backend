import sequelize from "./config/database.js";
import { QueryTypes } from "sequelize";

async function main() {
  try {
    const tours = await sequelize.query(
      "SELECT id, title, price FROM tours ORDER BY price DESC LIMIT 10",
      { type: QueryTypes.SELECT }
    );
    console.log("Top 10 most expensive tours in Aiven DB:");
    for (const t of tours) {
      console.log(`- ID: ${t.id}, Title: "${t.title}", Price: ${t.price}`);
    }
  } catch (error) {
    console.error("Error checking prices:", error.message);
  } finally {
    process.exit(0);
  }
}

main();
