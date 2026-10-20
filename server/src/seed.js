import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { sequelize } from './db.js';
import { User } from './models/index.js';

dotenv.config();

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Подключение к БД установлено');

    // ОЧИСТКА БАЗЫ ПЕРЕД ЗАПОЛНЕНИЕМ
    await sequelize.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
    console.log('Старые данные удалены');

    const hash = await bcrypt.hash('123456', 10);

    await User.bulkCreate([
      { last_name: 'Админов',  first_name: 'Александр', middle_name: 'Сергеевич',  email: 'admin@tech.ru',  password_hash: hash, role: 'admin'  },
      { last_name: 'Иванов',   first_name: 'Иван',      middle_name: 'Петрович',   email: 'ivan@tech.ru',   password_hash: hash, role: 'buyer'  },
      { last_name: 'Петров',   first_name: 'Пётр',      middle_name: 'Алексеевич', email: 'petr@tech.ru',   password_hash: hash, role: 'buyer'  },
      { last_name: 'Смирнов',  first_name: 'Олег',      middle_name: 'Игоревич',   email: 'shop@tech.ru',   password_hash: hash, role: 'seller' },
      { last_name: 'Кузнецов', first_name: 'Дмитрий',   middle_name: 'Валерьевич', email: 'gp@tech.ru',     password_hash: hash, role: 'seller' },
      { last_name: 'Морозов',  first_name: 'Алексей',   middle_name: 'Николаевич', email: 'alex@tech.ru',   password_hash: hash, role: 'master' },
      { last_name: 'Волков',   first_name: 'Сергей',    middle_name: 'Петрович',   email: 'sergey@tech.ru', password_hash: hash, role: 'master' },
    ]);

    console.log('Пользователи успешно добавлены');
    await sequelize.close();
  } catch (e) {
    console.error('Ошибка при заполнении:', e);
    process.exit(1);
  }
}

seed();