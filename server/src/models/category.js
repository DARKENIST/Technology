import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Category = sequelize.define('Category', {
  id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
}, {
  tableName: 'categories',
  timestamps: false,
});