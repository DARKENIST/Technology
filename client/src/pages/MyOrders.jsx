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

// Компонент визуализации статуса заказа
const OrderTimeline = ({ status }) => {
  if (status === 'canceled') {
    return (
      <div className="my-4 p-3 bg-red-50 border border-red-100 rounded-md text-center text-red-600 text-sm font-medium">
        Заказ отменён
      </div>
    );
  }

  const steps = [
    { key: 'new', label: 'Новый' },
    { key: 'paid', label: 'Оплачен' },
    { key: 'shipped', label: 'В пути' },
    { key: 'delivered', label: 'Доставлен' },
  ];

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="my-6 px-2">
      <div className="flex items-center justify-between relative">
        {/* Фоновая линия */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded"></div>
        {/* Линия прогресса */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-sky-500 -z-10 rounded transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center bg-white px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300
                  ${isCompleted ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-slate-300 text-slate-400'}
                  ${isCurrent ? 'ring-4 ring-sky-100' : ''}
                `}
              >
                {index + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login');
    api.get('/orders/my').then(({ data }) => setOrders(data));
  }, [navigate]);

  // Функция для перехода к оплате
  const handlePay = async (orderId) => {
    try {
      // Запрос к бэкенду для создания платежа
      const { data } = await api.post(`/payments/create/${orderId}`);
      // Перенаправление на страницу оплаты платежной системы
      window.location.href = data.confirmation_url;
    } catch (e) {
      alert('Ошибка при создании платежа. Попробуйте позже.');
    }
  };

  // Функция для оставления отзыва
  const handleReview = async (productId, sellerId) => {
    const ratingStr = prompt('Оцените товар от 1 до 5:');
    if (!ratingStr) return;

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
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-bold text-slate-900">Заказ №{order.id}</span>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(order.created_at).toLocaleString('ru-RU')} • {order.address}
                    </p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full
                    ${order.status === 'canceled' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}
                  `}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>

                {/* Таймлайн заказа */}
                <OrderTimeline status={order.status} />

                {/* Состав заказа */}
                <div className="border-t border-slate-100 pt-4">
                  <ul className="space-y-3 text-sm">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-medium text-slate-800">{item.product?.title}</span> 
                          <span className="text-slate-500 ml-2">× {item.quantity}</span>
                          
                          {/* Кнопка отзыва доступна только после доставки */}
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
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-lg font-bold">
                    Итого: <span className="text-sky-600">{Number(order.total).toLocaleString('ru-RU')} ₽</span>
                  </div>
                  
                  {/* Кнопка оплаты для новых заказов */}
                  {order.status === 'new' && (
                    <button 
                      onClick={() => handlePay(order.id)}
                      className="rounded-md bg-green-500 px-6 py-2 text-white font-medium hover:bg-green-600 transition shadow-sm"
                    >
                      Оплатить заказ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}