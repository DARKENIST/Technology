import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);

// Получить свой профиль
router.get('/me', async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

  res.json({
    ...user.toJSON(),
    fullName: user.fullName,
    shortName: user.shortName,
  });
});

// Обновить профиль
router.put('/me', async (req, res) => {
  try {
    const { last_name, first_name, middle_name, email, phone, bio, city, avatar_url } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(409).json({ message: 'Email уже занят' });
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ where: { phone } });
      if (exists) return res.status(409).json({ message: 'Телефон уже используется' });
      user.phone = phone;
    }

    if (last_name)   user.last_name   = last_name;
    if (first_name)  user.first_name  = first_name;
    if (middle_name !== undefined) user.middle_name = middle_name || null;
    if (bio         !== undefined) user.bio         = bio;
    if (city        !== undefined) user.city        = city;
    if (avatar_url  !== undefined) user.avatar_url  = avatar_url;

    user.updated_at = new Date();
    await user.save();

    res.json({
      ...user.toJSON(),
      fullName: user.fullName,
      shortName: user.shortName,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка обновления профиля', error: e.message });
  }
});

// Сменить пароль
router.put('/me/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Заполните оба поля' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Пароль минимум 6 символов' });

    const user = await User.findByPk(req.user.id);
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Неверный текущий пароль' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.updated_at = new Date();
    await user.save();

    res.json({ message: 'Пароль успешно изменён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка смены пароля', error: e.message });
  }
});

export default router;