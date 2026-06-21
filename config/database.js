import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Tên database
  process.env.DB_USERNAME, // Username
  process.env.DB_PASS, // Password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {}
  }
);

sequelize.authenticate().then(() => {
  console.log('Kết nối database thành công!');
}).catch((error) => {
  console.error('Kết nối database thất bại: ', error);
});

export default sequelize;
