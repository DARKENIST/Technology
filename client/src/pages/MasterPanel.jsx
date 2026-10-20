import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';

const STATUS_LABEL = {
  new: 'Новая', in_progress: 'В работе', diagnostics: 'Диагностика',
  approved: 'Согласована', repairing: 'Ремонт', done: 'Готово', canceled: 'Отменена',
};

export default function MasterPanel() {
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [assigned, setAssigned] = useState([]);

  const load = () => {
    api.get('/repairs/available').then(({ data }) => setAvailable(data));
    api.get('/repairs/assigned').then(({ data }) => setAssigned(data));
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !['master','admin'].includes(user.role)) return navigate('/login');
    load();
  }, [navigate]);

  const take = async id => {
    await api.post(`/repairs/${id}/take`);
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/repairs/${id}`, { status });
    load();
  };

  const setPrice = async (id) => {
    const value = prompt('Введите стоимость работ (₽):');
    if (!value) return;
    await api.put(`/repairs/${id}`, { price: Number(value) });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        <section>
          <h1 className="text-2xl font-bold mb-4">Доступные заявки</h1>
          {available.length === 0 ? (
            <p className="text-slate-500">Нет новых заявок.</p>
          ) : (
            <div className="space-y-3">
              {available.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start">
                  <div>
                    <p className="font-medium">{r.device?.brand} {r.device?.model}</p>
                    <p className="text-sm text-slate-600 mt-1">{r.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Заказчик: {r.buyer?.last_name} {r.buyer?.first_name} • {r.buyer?.phone}
                    </p>
                  </div>
                  <button onClick={() => take(r.id)}
                    className="rounded-md bg-sky-500 px-4 py-2 text-white text-sm hover:bg-sky-600">
                    Взять в работу
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Мои заявки</h2>
          {assigned.length === 0 ? (
            <p className="text-slate-500">Нет назначенных заявок.</p>
          ) : (
            <div className="space-y-3">
              {assigned.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">{r.device?.brand} {r.device?.model}</p>
                    <span className="text-xs rounded-full bg-sky-100 text-sky-700 px-3 py-1">
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{r.description}</p>
                  <p className="text-xs text-slate-500 mb-3">
                    Заказчик: {r.buyer?.last_name} {r.buyer?.first_name} • {r.buyer?.phone}
                    {r.price && ` • ${Number(r.price).toLocaleString('ru-RU')} ₽`}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm">
                      {Object.entries(STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <button onClick={() => setPrice(r.id)}
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100">
                      Указать цену
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}