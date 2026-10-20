import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User, Product, RepairRequest, Order, OrderItem, Category, Device, Review } from '../models/index.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(auth, requireRole('admin'));

// ================== СТАТИСТИКА ==================

router.get('/stats', async (req, res) => {
  try {
    const [
      usersCount, buyersCount, sellersCount, mastersCount,
      productsCount, repairsCount, ordersCount, revenue,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'buyer'  } }),
      User.count({ where: { role: 'seller' } }),
      User.count({ where: { role: 'master' } }),
      Product.count(),
      RepairRequest.count(),
      Order.count(),
      OrderItem.sum('price'),
    ]);

    res.json({
      users:    { total: usersCount, buyers: buyersCount, sellers: sellersCount, masters: mastersCount },
      products: productsCount,
      repairs:  repairsCount,
      orders:   ordersCount,
      revenue:  Number(revenue || 0),
    });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка статистики', error: e.message });
  }
});

// ================== ПОЛЬЗОВАТЕЛИ ==================

// Список с фильтрами
router.get('/users', async (req, res) => {
  try {
    const { role, blocked, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (blocked === 'true')  where.is_blocked = true;
    if (blocked === 'false') where.is_blocked = false;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });

    const filtered = search
      ? users.filter(u =>
          `${u.last_name} ${u.first_name} ${u.email}`
            .toLowerCase().includes(search.toLowerCase()))
      : users;

    res.json(filtered);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Изменить роль
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['buyer', 'seller', 'master', 'admin'];
    if (!allowed.includes(role))
      return res.status(400).json({ message: 'Недопустимая роль' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (user.id === req.user.id && role !== 'admin')
      return res.status(400).json({ message: 'Нельзя снять с себя роль админа' });

    user.role = role;
    user.updated_at = new Date();
    await user.save();

    res.json({ id: user.id, role: user.role });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Заблокировать / разблокировать
router.put('/users/:id/block', async (req, res) => {
  try {
    const { is_blocked, reason } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (user.id === req.user.id)
      return res.status(400).json({ message: 'Нельзя заблокировать себя' });

    user.is_blocked = !!is_blocked;
    user.blocked_reason = is_blocked ? (reason || null) : null;
    user.updated_at = new Date();
    await user.save();

    res.json({ id: user.id, is_blocked: user.is_blocked, blocked_reason: user.blocked_reason });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Удалить пользователя
router.delete('/users/:id', async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id)
      return res.status(400).json({ message: 'Нельзя удалить себя' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    await user.destroy();
    res.json({ message: 'Пользователь удалён' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// ================== ТОВАРЫ ==================

router.get('/products', async (req, res) => {
  try {
    const { category, seller, search, condition } = req.query;
    const where = {};
    if (category)  where.category_id = category;
    if (seller)    where.seller_id   = seller;
    if (condition) where.condition   = condition;

    const products = await Product.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'seller', attributes: ['id', 'last_name', 'first_name', 'email'] },
      ],
    });

    const filtered = search
      ? products.filter(p =>
          `${p.title} ${p.brand || ''}`.toLowerCase().includes(search.toLowerCase()))
      : products;

    res.json(filtered);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Удалить товар
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    await product.destroy();
    res.json({ message: 'Товар удалён' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// ================== ЗАЯВКИ НА РЕМОНТ ==================

router.get('/repairs', async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;

    const repairs = await RepairRequest.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: Device, as: 'device', include: ['category'] },
        { model: User, as: 'buyer',  attributes: ['id', 'last_name', 'first_name', 'email'] },
        { model: User, as: 'master', attributes: ['id', 'last_name', 'first_name', 'email'] },
      ],
    });

    const filtered = search
      ? repairs.filter(r =>
          `${r.device?.brand || ''} ${r.device?.model || ''} ${r.description || ''}`
            .toLowerCase().includes(search.toLowerCase()))
      : repairs;

    res.json(filtered);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Изменить статус / цену / мастера
router.put('/repairs/:id', async (req, res) => {
  try {
    const { status, price, master_id } = req.body;
    const allowed = ['new', 'in_progress', 'diagnostics', 'approved', 'repairing', 'done', 'canceled'];

    const repair = await RepairRequest.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Заявка не найдена' });

    if (status && allowed.includes(status)) repair.status = status;
    if (price !== undefined) repair.price = price;
    if (master_id !== undefined) repair.master_id = master_id || null;
    repair.updated_at = new Date();

    await repair.save();
    res.json(repair);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Удалить заявку
router.delete('/repairs/:id', async (req, res) => {
  try {
    const repair = await RepairRequest.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Заявка не найдена' });
    await repair.destroy();
    res.json({ message: 'Заявка удалена' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// ================== ЗАКАЗЫ ==================

router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'last_name', 'first_name', 'email', 'phone'] },
        {
          model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'title', 'price'] }],
        },
      ],
    });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'paid', 'shipped', 'delivered', 'canceled'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Недопустимый статус' });

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    order.status = status;
    order.updated_at = new Date();
    await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    await order.destroy();
    res.json({ message: 'Заказ удалён' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// ================== КАТЕГОРИИ ==================

router.post('/categories', async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug)
      return res.status(400).json({ message: 'Укажите name и slug' });

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категория не найдена' });

    if (req.body.name) category.name = req.body.name;
    if (req.body.slug) category.slug = req.body.slug;
    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категория не найдена' });

    const productsCount = await Product.count({ where: { category_id: category.id } });
    const devicesCount  = await Device.count({ where: { category_id: category.id } });
    if (productsCount || devicesCount)
      return res.status(409).json({
        message: `Нельзя удалить: используется в ${productsCount} товарах и ${devicesCount} устройствах`,
      });

    await category.destroy();
    res.json({ message: 'Категория удалена' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// ================== УСТРОЙСТВА ==================

router.post('/devices', async (req, res) => {
  try {
    const { category_id, brand, model, release_year } = req.body;
    if (!category_id || !brand || !model)
      return res.status(400).json({ message: 'Заполните обязательные поля' });

    const device = await Device.create({ category_id, brand, model, release_year });
    res.status(201).json(device);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

router.put('/devices/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) return res.status(404).json({ message: 'Устройство не найдено' });

    const fields = ['category_id', 'brand', 'model', 'release_year'];
    fields.forEach(f => { if (req.body[f] !== undefined) device[f] = req.body[f]; });
    await device.save();
    res.json(device);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

router.delete('/devices/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) return res.status(404).json({ message: 'Устройство не найдено' });

    const repairsCount = await RepairRequest.count({ where: { device_id: device.id } });
    if (repairsCount)
      return res.status(409).json({ message: `Нельзя удалить: устройство используется в ${repairsCount} заявках` });

    await device.destroy();
    res.json({ message: 'Устройство удалено' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// ================== ОТЗЫВЫ ==================

router.get('/reviews', async (req, res) => {
  const reviews = await Review.findAll({
    order: [['created_at', 'DESC']],
    include: [
      { model: User, as: 'author', attributes: ['id', 'last_name', 'first_name'] },
      { model: User, as: 'target', attributes: ['id', 'last_name', 'first_name'] },
      { model: Product, as: 'product', attributes: ['id', 'title'] },
    ],
  });
  res.json(reviews);
});

router.delete('/reviews/:id', async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ message: 'Отзыв не найден' });
  await review.destroy();
  res.json({ message: 'Отзыв удалён' });
});

export default router;