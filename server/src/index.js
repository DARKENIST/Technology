import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './db.js';
import './models/index.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import repairRoutes from './routes/repairs.js';
import sellerRoutes from './routes/seller.js';
import categoryRoutes from './routes/categories.js';
import deviceRoutes from './routes/devices.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

// Никакого sync — таблицы уже созданы SQL-скриптом.
// Просто проверяем, что подключение работает.
sequelize.authenticate()
  .then(() => {
    console.log('Подключение к PostgreSQL установлено');
    app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));
  })
  .catch(err => console.error('Ошибка подключения к БД:', err));