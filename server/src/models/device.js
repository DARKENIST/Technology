import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Device = sequelize.define('Device', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id:  { type: DataTypes.INTEGER, allowNull: false },
  brand:        { type: DataTypes.STRING(80),  allowNull: false },
  model:        { type: DataTypes.STRING(120), allowNull: false },
  release_year: { type: DataTypes.INTEGER },
}, {
  tableName: 'devices',
  timestamps: false,
});