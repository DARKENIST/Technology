import { Router } from 'express';
import { RepairRequest, Device, Category, User } from '../models/index.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(auth);

// Справочник устройств (для формы)
router.get('/devices', async (req, res) => {
  const devices = await Device.findAll({
    include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    order: [['brand', 'ASC'], ['model', 'ASC']],
  });
  res.json(devices);
});

// Создать заявку
router.post('/', async (req, res) => {
  try {
    const { device_id, description } = req.body;
    if (!device_id || !description)
      return res.status(400).json({ message: 'Выберите устройство и опишите проблему' });

    const repair = await RepairRequest.create({
      buyer_id: req.user.id,
      device_id,
      description,
      status: 'new',
    });

    res.status(201).json(repair);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка создания заявки', error: e.message });
  }
});

// Мои заявки (покупатель)
router.get('/my', async (req, res) => {
  const repairs = await RepairRequest.findAll({
    where: { buyer_id: req.user.id },
    order: [['created_at', 'DESC']],
    include: [
      { model: Device, as: 'device', include: ['category'] },
      { model: User, as: 'master', attributes: ['id', 'first_name', 'last_name', 'phone'] },
    ],
  });
  res.json(repairs);
});

// Доступные заявки (мастер): где он ещё не назначен
router.get('/available', requireRole('master', 'admin'), async (req, res) => {
  const repairs = await RepairRequest.findAll({
    where: { master_id: null, status: 'new' },
    order: [['created_at', 'DESC']],
    include: [
      { model: Device, as: 'device', include: ['category'] },
      { model: User, as: 'buyer', attributes: ['id', 'first_name', 'last_name', 'phone'] },
    ],
  });
  res.json(repairs);
});

// Заявки мастера
router.get('/assigned', requireRole('master', 'admin'), async (req, res) => {
  const repairs = await RepairRequest.findAll({
    where: { master_id: req.user.id },
    order: [['created_at', 'DESC']],
    include: [
      { model: Device, as: 'device', include: ['category'] },
      { model: User, as: 'buyer', attributes: ['id', 'first_name', 'last_name', 'phone'] },
    ],
  });
  res.json(repairs);
});

// Взять заявку
router.post('/:id/take', requireRole('master', 'admin'), async (req, res) => {
  const repair = await RepairRequest.findByPk(req.params.id);
  if (!repair) return res.status(404).json({ message: 'Заявка не найдена' });
  if (repair.master_id) return res.status(409).json({ message: 'Заявка уже принята' });

  repair.master_id = req.user.id;
  repair.status = 'in_progress';
  repair.updated_at = new Date();
  await repair.save();

  res.json(repair);
});

// Сменить статус и цену (мастер)
router.put('/:id', requireRole('master', 'admin'), async (req, res) => {
  const repair = await RepairRequest.findByPk(req.params.id);
  if (!repair) return res.status(404).json({ message: 'Заявка не найдена' });
  if (repair.master_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Нет прав' });

  const allowed = ['new', 'in_progress', 'diagnostics', 'approved', 'repairing', 'done', 'canceled'];
  const { status, price } = req.body;

  if (status && allowed.includes(status)) repair.status = status;
  if (price !== undefined) repair.price = price;
  repair.updated_at = new Date();

  await repair.save();
  res.json(repair);
});

export default router;