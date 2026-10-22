import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Favorite = sequelize.define('Favorite', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'favorites',
  timestamps: false, // created_at не используется в Sequelize, он создается БД
});
