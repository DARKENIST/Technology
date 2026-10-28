import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b'];

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

  // Форматирование дат для графика
  const formattedChartData = stats.revenueChart.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    total: Number(item.total)
  }));

  return (
    <div className="space-y-6">
      {/* Блок с основными цифрами */}
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

      {/* Блок с графиками */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* График выручки (линейный) */}
        <div className="bg-white p-5 rounded-lg shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Выручка за последние дни</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value} ₽`} />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* График ролей (круговой) */}
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Пользователи по ролям</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.rolesChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.rolesChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}