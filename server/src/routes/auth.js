import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { last_name, first_name, middle_name, email, password, role } = req.body;

    if (!last_name || !first_name || !email || !password)
      return res.status(400).json({ message: 'Заполните обязательные поля' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email уже занят' });

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      last_name, first_name, middle_name,
      email, password_hash,
      role: role || 'buyer',
    });

    res.status(201).json({
      id: user.id,
      last_name: user.last_name,
      first_name: user.first_name,
      middle_name: user.middle_name,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка регистрации', error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (user.is_blocked)
      return res.status(403).json({ message: 'Аккаунт заблокирован: ' + (user.blocked_reason || 'без указания причины') });
    if (!ok) return res.status(401).json({ message: 'Неверный email или пароль' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        last_name: user.last_name,
        first_name: user.first_name,
        middle_name: user.middle_name,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка входа', error: e.message });
  }
});

export default router;