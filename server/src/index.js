import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './db.js';
import './models/index.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Никакого sync — таблицы уже созданы SQL-скриптом.
// Просто проверяем, что подключение работает.
sequelize.authenticate()
  .then(() => {
    console.log('Подключение к PostgreSQL установлено');
    app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));
  })
  .catch(err => console.error('Ошибка подключения к БД:', err));