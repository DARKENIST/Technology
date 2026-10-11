import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { sequelize } from './db.js';
import { User } from './models/index.js';

dotenv.config();

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Подключение к БД установлено');

    const hash = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      { username: 'admin',          email: 'admin@tech.ru',  password_hash: hash, role: 'admin'  },
      { username: 'Иван',           email: 'ivan@tech.ru',   password_hash: hash, role: 'client'  },
      { username: 'Пётр',           email: 'petr@tech.ru',   password_hash: hash, role: 'client'  },
      { username: 'Технолоджи',       email: 'shop@tech.ru',   password_hash: hash, role: 'seller' },
      { username: 'Мастер Алексей', email: 'alex@tech.ru',   password_hash: hash, role: 'master' },
      { username: 'Мастер Сергей',  email: 'sergey@tech.ru', password_hash: hash, role: 'master' },
    ]);

    console.log('Пользователи добавлены');
    await sequelize.close();
  } catch (e) {
    console.error('Ошибка:', e);
    process.exit(1);
  }
}

seed();