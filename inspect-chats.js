import sequelize from "./config/database.js";
import { QueryTypes } from "sequelize";

async function main() {
  try {
    const chats = await sequelize.query(
      "SELECT id, roomChatId, content, senderType, createdAt FROM chats ORDER BY id DESC LIMIT 10",
      { type: QueryTypes.SELECT }
    );
    console.log("Recent chat logs:");
    for (const c of chats) {
      console.log(`- ID: ${c.id}, Room: ${c.roomChatId}, Sender: ${c.senderType}, Created: ${c.createdAt}`);
      console.log(`  Content: "${c.content}"\n`);
    }
  } catch (error) {
    console.error("Error checking chats:", error.message);
  } finally {
    process.exit(0);
  }
}

main();
