import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const RepairRequest = sequelize.define('RepairRequest', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyer_id:    { type: DataTypes.INTEGER, allowNull: false },
  master_id:   { type: DataTypes.INTEGER },
  device_id:   { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  status:      { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'new' },
  price:       { type: DataTypes.DECIMAL(10, 2) },
  created_at:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'repair_requests',
  timestamps: false,
});