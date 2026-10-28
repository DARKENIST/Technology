import { Router } from 'express';
import { YooKassa } from 'yookassa-api-sdk';
import { Order } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Инициализация SDK
const sdk = YooKassa({
    shop_id: process.env.YOOKASSA_SHOP_ID,
    secret_key: process.env.YOOKASSA_SECRET_KEY,
});

router.post('/create/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Заказ не найден' });
        if (order.status !== 'new') return res.status(400).json({ message: 'Заказ уже оплачен или отменен' });

        // Создаем платеж в ЮKassa
        const payment = await sdk.payments.create({
            amount: {
                value: order.total.toString(), // ЮKassa требует строку с точкой
                currency: 'RUB',
            },
            confirmation: {
                type: 'redirect',
                return_url: `http://localhost:5173/my-orders`, // Куда вернется пользователь после оплаты
            },
            capture: true, // Автоматическое списание (одностадийная оплата)
            description: `Оплата заказа №${order.id}`,
            metadata: {
                order_id: order.id, // Важно для связи платежа с заказом
            },
        });

        // Возвращаем ссылку на оплату
        res.json({ confirmation_url: payment.confirmation.confirmation_url });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка создания платежа', error: e.message });
    }
});

export default router;