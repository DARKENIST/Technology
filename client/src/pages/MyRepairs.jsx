import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';

const STATUS_LABEL = {
  new: 'Новая',
  in_progress: 'В работе',
  diagnostics: 'Диагностика',
  approved: 'Согласована',
  repairing: 'Ремонт',
  done: 'Готово',
  canceled: 'Отменена',
};

export default function MyRepairs() {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login');
    api.get('/repairs/my').then(({ data }) => setRepairs(data));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Мои заявки на ремонт</h1>

        {repairs.length === 0 ? (
          <p className="text-slate-500">Заявок пока нет.</p>
        ) : (
          <div className="space-y-4">
            {repairs.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {r.device?.brand} {r.device?.model}
                  </span>
                  <span className="text-sm rounded-full bg-sky-100 text-sky-700 px-3 py-1">
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{r.description}</p>
                {r.master && (
                  <p className="text-xs text-slate-500">
                    Мастер: {r.master.last_name} {r.master.first_name}
                    {r.master.phone && ` • ${r.master.phone}`}
                  </p>
                )}
                {r.price && (
                  <p className="text-sm font-medium text-sky-600 mt-2">
                    Стоимость: {Number(r.price).toLocaleString('ru-RU')} ₽
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}