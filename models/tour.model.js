import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import slugify from "slugify";

const Tour = sequelize.define("Tour", {
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
  code: {
    type: DataTypes.STRING(10),
  },
  images: {
    type: DataTypes.TEXT('long'),
  },
  price: {
    type: DataTypes.INTEGER,
  },
  discount: {
    type: DataTypes.INTEGER,
  },
  information: {
    type: DataTypes.TEXT('long'),
  },
  schedule: {
    type: DataTypes.TEXT('long'),
  },
  timeStart: {
    type: DataTypes.DATE,
  },
  stock: {
    type: DataTypes.INTEGER,
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
  title_no_accent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  information_no_accent: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  schedule_no_accent: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
}, {
  tableName: 'tours',
  timestamps: true, // Tự động quản lý createdAt và updatedAt
});

const removeAccents = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

Tour.beforeCreate((tour) => {
  tour["slug"] = slugify(`${tour["title"]}-${Date.now()}`, {
    lower: true,
    strict: true
  });
  if (tour["title"]) tour["title_no_accent"] = removeAccents(tour["title"]);
  if (tour["information"]) tour["information_no_accent"] = removeAccents(tour["information"]);
  if (tour["schedule"]) tour["schedule_no_accent"] = removeAccents(tour["schedule"]);
});

Tour.beforeUpdate((tour) => {
  if (tour["title"]) tour["title_no_accent"] = removeAccents(tour["title"]);
  if (tour["information"]) tour["information_no_accent"] = removeAccents(tour["information"]);
  if (tour["schedule"]) tour["schedule_no_accent"] = removeAccents(tour["schedule"]);
});

export default Tour;
