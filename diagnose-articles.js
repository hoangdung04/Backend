import sequelize from "./config/database.js";
import Article from "./models/article.model.js";

async function diagnose() {
  try {
    await sequelize.authenticate();
    console.log("=== ARTICLE DIAGNOSIS ===");
    
    // Check articles columns
    const [columns] = await sequelize.query("SHOW COLUMNS FROM articles");
    console.log("=== COLUMNS ===");
    console.log(columns.map(c => ({ Field: c.Field, Type: c.Type })));

    // Query all articles
    const articles = await Article.findAll({ raw: true });
    console.log("=== ARTICLES RECORDS ===");
    console.log(articles.map(a => ({
      id: a.id,
      title: a.title,
      image: a.image,
      thumbnail: a.thumbnail
    })));

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

diagnose();
