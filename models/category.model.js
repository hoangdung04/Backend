import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id',
    }
  },
  image: {
    type: DataTypes.STRING(255),
  },
  description: {
    type: DataTypes.TEXT('long'),
  },
  status: {
    type: DataTypes.STRING(20),
  },
  position: {
    type: DataTypes.INTEGER,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Đặt giá trị mặc định là false
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'categories',
  timestamps: true, // Tự động quản lý createdAt và updatedAt
});

export default Category;
