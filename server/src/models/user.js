import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const User = sequelize.define('User', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  last_name:     { type: DataTypes.STRING(50),  allowNull: false },
  first_name:    { type: DataTypes.STRING(50),  allowNull: false },
  middle_name:   { type: DataTypes.STRING(50) },
  email:         { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role:          { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'buyer' },
  avatar_url:    { type: DataTypes.STRING(255) },
  phone:         { type: DataTypes.STRING(20) },
  bio:           { type: DataTypes.TEXT },
  city:          { type: DataTypes.STRING(80) },
  created_at:    { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at:    { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  is_blocked:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  blocked_reason: { type: DataTypes.TEXT },
}, {
  tableName: 'users',
  timestamps: false,

  // Виртуальные поля — не хранятся в БД, но удобны в коде
  getters: {
    fullName() {
      const { last_name, first_name, middle_name } = this.get();
      return [last_name, first_name, middle_name].filter(Boolean).join(' ');
    },
    shortName() {
      const { last_name, first_name, middle_name } = this.get();
      const initials = [first_name?.[0], middle_name?.[0]].filter(Boolean).map(c => c + '.').join(' ');
      return `${last_name} ${initials}`.trim();
    },
  },
});