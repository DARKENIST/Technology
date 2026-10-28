import { Router } from 'express';
import { Order } from '../models/index.js';

const router = Router();

router.post('/yookassa', async (req, res) => {
    try {
        const event = req.body;
        
        // Проверяем, что это успешный платеж
        if (event.event === 'payment.succeeded') {
            const orderId = event.object.metadata.order_id;
            
            const order = await Order.findByPk(orderId);
            if (order && order.status === 'new') {
                order.status = 'paid'; // Меняем статус на "Оплачен"
                order.payment_method = 'online'; // Можно обновить способ оплаты
                await order.save();
                console.log(`Заказ №${orderId} успешно оплачен`);
            }
        }
        
        // ЮKassa ожидает ответ 200 OK
        res.status(200).send('OK');
    } catch (e) {
        console.error('Webhook error:', e);
        res.status(500).send('Error');
    }
});

export default router;