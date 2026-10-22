import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { sequelize } from './db.js';
import './models/index.js';

// Импорт маршрутов
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import repairRoutes from './routes/repairs.js';
import sellerRoutes from './routes/seller.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from './routes/categories.js';
import deviceRoutes from './routes/devices.js';
import uploadRoutes from './routes/upload.js';
import favoriteRoutes from './routes/favorites.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Настройка статического маршрута для файлов изображений
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Обработка корневого маршрута API
app.get('/', (req, res) => {
  res.json({ message: 'API Технолоджи работает. Откройте http://localhost:5173' });
});

// Обработка служебного запроса браузера
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});
});

// Регистрация маршрутов API
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

// Установка соединения с базой данных и запуск сервера
sequelize.authenticate()
  .then(() => {
    console.log('Подключение к PostgreSQL установлено');
    app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
  })
  .catch(err => console.error('Ошибка подключения к БД:', err));