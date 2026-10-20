import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Order = sequelize.define('Order', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyer_id:       { type: DataTypes.INTEGER, allowNull: false },
  total:          { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  status:         { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'new' },
  address:        { type: DataTypes.TEXT, allowNull: false },
  phone:          { type: DataTypes.STRING(20), allowNull: false },
  payment_method: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'card' },
  comment:        { type: DataTypes.TEXT },
  created_at:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'orders',
  timestamps: false,
});