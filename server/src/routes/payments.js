import { Router } from 'express';
import { Order } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Маршрут для создания (имитации) платежа
router.post('/create/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // В реальной системе здесь был бы запрос к банку.
    // Для тестового режима мы просто возвращаем успешный ответ с URL нашей страницы.
    
    // Формируем URL для перенаправления на страницу оплаты на фронтенде
    // В продакшене (на Render) здесь должен быть ваш реальный адрес сайта
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    res.json({ 
      paymentUrl: `${clientUrl}/payment/${order.id}` 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка создания платежа', error: e.message });
  }
});

export default router;