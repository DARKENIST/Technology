import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Product = sequelize.define('Product', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seller_id:   { type: DataTypes.INTEGER, allowNull: false },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  title:       { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  brand:       { type: DataTypes.STRING(80) },
  price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  condition:   { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'new' },
  image_url:   { type: DataTypes.STRING(255) },
  stock:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  created_at:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'products',
  timestamps: false,
});