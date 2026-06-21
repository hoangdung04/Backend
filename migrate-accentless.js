import sequelize from "./config/database.js";
import { QueryTypes } from "sequelize";

// Helper function to remove Vietnamese accents
export const removeAccents = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

async function runMigration() {
  try {
    console.log("Starting migration to add accentless columns...");

    // 1. Add columns if they do not exist
    const addColumnsQueries = [
      "ALTER TABLE tours ADD COLUMN title_no_accent VARCHAR(255) NULL;",
      "ALTER TABLE tours ADD COLUMN information_no_accent TEXT NULL;",
      "ALTER TABLE tours ADD COLUMN schedule_no_accent TEXT NULL;"
    ];

    for (const sql of addColumnsQueries) {
      try {
        await sequelize.query(sql);
        console.log(`Successfully executed: ${sql}`);
      } catch (err) {
        if (err.message.includes("Duplicate column name")) {
          console.log(`Column already exists. Skipping.`);
        } else {
          throw err;
        }
      }
    }

    // 2. Fetch all existing tours
    const tours = await sequelize.query(
      "SELECT id, title, information, schedule FROM tours",
      { type: QueryTypes.SELECT }
    );

    console.log(`Found ${tours.length} tours. Updating accentless fields...`);

    // 3. Update each tour
    for (const tour of tours) {
      const titleNo = removeAccents(tour.title);
      const infoNo = removeAccents(tour.information);
      const schedNo = removeAccents(tour.schedule);

      await sequelize.query(
        `UPDATE tours SET 
          title_no_accent = :titleNo, 
          information_no_accent = :infoNo, 
          schedule_no_accent = :schedNo 
         WHERE id = :id`,
        {
          replacements: {
            titleNo,
            infoNo,
            schedNo,
            id: tour.id
          }
        }
      );
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
