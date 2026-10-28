import { Router } from 'express';
import { sequelize } from '../db.js';
import { Order, OrderItem, Product, User, Category } from '../models/index.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(auth);

// Создать заказ из корзины
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, address, phone, payment_method, comment } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ message: 'Корзина пуста' });
    if (!address || !phone)
      return res.status(400).json({ message: 'Укажите адрес и телефон' });

    // Получаем товары из БД, чтобы не доверять цене с клиента
    const productIds = items.map(i => i.product_id);
    const products = await Product.findAll({ where: { id: productIds } });
    if (products.length !== productIds.length)
      return res.status(400).json({ message: 'Некоторые товары недоступны' });

    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) continue;
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Недостаточно товара: ${product.title}` });

      const price = Number(product.price);
      total += price * item.quantity;

      orderItemsData.push({
        product_id: product.id,
        seller_id: product.seller_id,
        quantity: item.quantity,
        price,
      });

      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    const order = await Order.create({
      buyer_id: req.user.id,
      total,
      address,
      phone,
      payment_method: payment_method || 'card',
      comment,
    }, { transaction: t });

    await OrderItem.bulkCreate(
      orderItemsData.map(i => ({ ...i, order_id: order.id })),
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ id: order.id, total, status: order.status });
  } catch (e) {
    await t.rollback();
    console.error(e);
    res.status(500).json({ message: 'Ошибка оформления заказа', error: e.message });
  }
});

// Мои заказы (покупатель)
router.get('/my', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { buyer_id: req.user.id },
      order: [['created_at', 'DESC']],
      include: [{
        model: OrderItem, as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'title', 'image_url', 'price'] }],
      }],
    });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Один заказ
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem, as: 'items',
        include: [{ model: Product, as: 'product' }],
      }],
    });
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    if (order.buyer_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Нет прав' });

    res.json(order);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка', error: e.message });
  }
});

// Сменить статус (продавец/админ)
router.put('/:id/status', requireRole('seller', 'admin'), async (req, res) => {
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
// Маршрут для имитации успешной оплаты
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    // Проверяем, что заказ принадлежит текущему пользователю
    if (order.buyer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав на оплату этого заказа' });
    }

    // Меняем статус на "Оплачен" и указываем способ оплаты
    order.status = 'paid';
    order.payment_method = 'card';
    order.updated_at = new Date();
    await order.save();

    res.json({ message: 'Оплата прошла успешно', order });
  } catch (e) {
    console.error('Ошибка при имитации оплаты:', e);
    res.status(500).json({ message: 'Ошибка сервера', error: e.message });
  }
});

export default router;