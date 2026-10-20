import { Router } from 'express';
import { Product, Order, OrderItem, User } from '../models/index.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(auth, requireRole('seller', 'admin'));

// Мои товары
router.get('/products', async (req, res) => {
  const products = await Product.findAll({
    where: { seller_id: req.user.id },
    order: [['created_at', 'DESC']],
  });
  res.json(products);
});

// Заказы на мои товары
router.get('/orders', async (req, res) => {
  const items = await OrderItem.findAll({
    where: { seller_id: req.user.id },
    include: [
      { model: Order, as: 'order',
        include: [{ model: User, as: 'buyer', attributes: ['id', 'first_name', 'last_name', 'phone'] }] },
      { model: Product, as: 'product', attributes: ['id', 'title', 'image_url'] },
    ],
  });

  // Группируем по заказу
  const grouped = {};
  items.forEach(item => {
    const id = item.order.id;
    if (!grouped[id]) grouped[id] = { order: item.order, items: [] };
    grouped[id].items.push(item);
  });

  res.json(Object.values(grouped));
});

// Статистика
router.get('/stats', async (req, res) => {
  const productsCount = await Product.count({ where: { seller_id: req.user.id } });
  const itemsSold = await OrderItem.sum('quantity', { where: { seller_id: req.user.id } });
  const revenue = await OrderItem.sum('price',  { where: { seller_id: req.user.id } });

  res.json({
    products: productsCount,
    sold: itemsSold || 0,
    revenue: Number(revenue || 0),
  });
});

export default router;