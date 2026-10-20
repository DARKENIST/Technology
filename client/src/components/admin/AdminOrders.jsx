import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const STATUSES = ['new', 'paid', 'shipped', 'delivered', 'canceled'];
const STATUS_LABEL = {
  new: 'Новый', paid: 'Оплачен', shipped: 'Отправлен',
  delivered: 'Доставлен', canceled: 'Отменён',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    const params = filter ? { status: filter } : {};
    api.get('/admin/orders', { params }).then(({ data }) => setOrders(data));
  };

  useEffect(() => { load(); }, [filter]);

  const update = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}`, { status });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  const remove = async id => {
    if (!confirm('Удалить заказ?')) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Заказ №{o.id}</span>
              <select value={o.status}
                onChange={e => update(o.id, e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>

            <p className="text-xs text-slate-500 mb-2">
              Покупатель: {o.buyer?.last_name} {o.buyer?.first_name} • {o.buyer?.email} • {o.buyer?.phone}
            </p>
            <p className="text-xs text-slate-500 mb-3">Адрес: {o.address}</p>

            <ul className="text-sm space-y-1 mb-3">
              {o.items.map(i => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.product?.title} × {i.quantity}</span>
                  <span>{(Number(i.price) * i.quantity).toLocaleString('ru-RU')} ₽</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center">
              <span className="font-bold">
                Итого: {Number(o.total).toLocaleString('ru-RU')} ₽
              </span>
              <button onClick={() => remove(o.id)}
                className="text-sm text-red-600 hover:underline">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}