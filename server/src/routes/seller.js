import { Router } from 'express';
import { Product, Order, OrderItem, User } from '../models/index.js';
import { auth, requireRole } from '../middleware/auth.js';
import { sequelize } from '../db.js'; 

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

  const grouped = {};
  items.forEach(item => {
    const id = item.order.id;
    if (!grouped[id]) grouped[id] = { order: item.order, items: [] };
    grouped[id].items.push(item);
  });

  res.json(Object.values(grouped));
});

// статистика с графиком продаж
router.get('/stats', async (req, res) => {
  try {
    const productsCount = await Product.count({ where: { seller_id: req.user.id } });
    const itemsSold = await OrderItem.sum('quantity', { where: { seller_id: req.user.id } });
    const revenue = await OrderItem.sum('price',  { where: { seller_id: req.user.id } });

    // Прямой SQL-запрос для получения выручки конкретного продавца по дням
    const salesChartRaw = await sequelize.query(`
      SELECT 
        TO_CHAR(o.created_at, 'YYYY-MM-DD') as date, 
        SUM(oi.price * oi.quantity) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.seller_id = :sellerId 
        AND o.status IN ('paid', 'shipped', 'delivered')
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
      LIMIT 7
    `, { 
      replacements: { sellerId: req.user.id },
      type: sequelize.QueryTypes.SELECT 
    });

    res.json({
      products: productsCount,
      sold: itemsSold || 0,
      revenue: Number(revenue || 0),
      salesChart: salesChartRaw
    });
  } catch (e) {
    console.error('Ошибка в seller/stats:', e);
    res.status(500).json({ message: 'Ошибка получения статистики', error: e.message });
  }
});

export default router;