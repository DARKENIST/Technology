import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';

const STATUS_LABEL = {
  new: 'Новый',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  canceled: 'Отменён',
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login');
    api.get('/orders/my').then(({ data }) => setOrders(data));
  }, [navigate]);

  // Функция для оставления отзыва
  const handleReview = async (productId, sellerId) => {
    const ratingStr = prompt('Оцените товар от 1 до 5:');
    if (!ratingStr) return; // Если нажали "Отмена"

    const rating = Number(ratingStr);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return alert('Оценка должна быть числом от 1 до 5');
    }

    const comment = prompt('Напишите комментарий (необязательно):');
    
    try {
      await api.post('/reviews', {
        product_id: productId,
        target_user_id: sellerId,
        rating: rating,
        comment: comment || 'Без комментария'
      });
      alert('Спасибо! Ваш отзыв опубликован.');
    } catch (e) {
      alert(e.response?.data?.message || 'Ошибка при отправке отзыва');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Мои заказы</h1>

        {orders.length === 0 ? (
          <p className="text-slate-500">
            Заказов пока нет. <Link to="/catalog" className="text-sky-600">Перейти в каталог</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Заказ №{order.id}</span>
                  <span className="text-sm rounded-full bg-sky-100 text-sky-700 px-3 py-1">
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  {new Date(order.created_at).toLocaleString('ru-RU')} • {order.address}
                </p>
                <ul className="space-y-2 text-sm">
                  {order.items.map(item => (
                    <li key={item.id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                      <div className="flex-1">
                        <span>{item.product?.title} × {item.quantity}</span>
                        
                        {/* Кнопка отзыва появляется только если заказ доставлен */}
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => handleReview(item.product.id, item.seller_id)}
                            className="ml-4 text-xs text-sky-600 hover:underline font-medium"
                          >
                            Оставить отзыв
                          </button>
                        )}
                      </div>
                      <span className="font-medium">{(Number(item.price) * item.quantity).toLocaleString('ru-RU')} ₽</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between font-bold">
                  <span>Итого</span>
                  <span>{Number(order.total).toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}