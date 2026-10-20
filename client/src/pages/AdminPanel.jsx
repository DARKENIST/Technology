import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';
import AdminStats from '../components/admin/AdminStats.jsx';
import AdminUsers from '../components/admin/AdminUsers.jsx';
import AdminProducts from '../components/admin/AdminProducts.jsx';
import AdminRepairs from '../components/admin/AdminRepairs.jsx';
import AdminOrders from '../components/admin/AdminOrders.jsx';
import AdminCategories from '../components/admin/AdminCategories.jsx';
import AdminDevices from '../components/admin/AdminDevices.jsx';
import AdminReviews from '../components/admin/AdminReviews.jsx';

const TABS = [
  { key: 'stats',      label: 'Статистика' },
  { key: 'users',      label: 'Пользователи' },
  { key: 'products',   label: 'Товары' },
  { key: 'repairs',    label: 'Заявки' },
  { key: 'orders',     label: 'Заказы' },
  { key: 'categories', label: 'Категории' },
  { key: 'devices',    label: 'Устройства' },
  { key: 'reviews',    label: 'Отзывы' },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') return navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Админ-панель</h1>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm ${tab === t.key ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600 hover:text-slate-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'stats'      && <AdminStats />}
        {tab === 'users'      && <AdminUsers />}
        {tab === 'products'   && <AdminProducts />}
        {tab === 'repairs'    && <AdminRepairs />}
        {tab === 'orders'     && <AdminOrders />}
        {tab === 'categories' && <AdminCategories />}
        {tab === 'devices'    && <AdminDevices />}
        {tab === 'reviews'    && <AdminReviews />}
      </div>
    </div>
  );
}