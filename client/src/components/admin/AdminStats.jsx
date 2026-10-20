import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="text-slate-500">Загрузка…</p>;

  const Card = ({ title, value, accent }) => (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-2xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Всего пользователей" value={stats.users.total} />
        <Card title="Покупателей" value={stats.users.buyers} />
        <Card title="Продавцов" value={stats.users.sellers} />
        <Card title="Мастеров" value={stats.users.masters} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Товаров" value={stats.products} />
        <Card title="Заявок на ремонт" value={stats.repairs} />
        <Card title="Заказов" value={stats.orders} />
        <Card title="Выручка" value={`${stats.revenue.toLocaleString('ru-RU')} ₽`} accent="text-sky-600" />
      </div>
    </div>
  );
}
