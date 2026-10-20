import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Review = sequelize.define('Review', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  author_id:      { type: DataTypes.INTEGER, allowNull: false },
  target_user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id:     { type: DataTypes.INTEGER },
  rating:         { type: DataTypes.INTEGER, allowNull: false },
  comment:        { type: DataTypes.TEXT },
  created_at:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'reviews',
  timestamps: false,
});