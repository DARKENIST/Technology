import React from 'react';
import { useEffect, useState } from 'react';
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
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product?.title} × {item.quantity}</span>
                      <span>{(Number(item.price) * item.quantity).toLocaleString('ru-RU')} ₽</span>
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