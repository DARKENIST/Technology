import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const STATUSES = ['new', 'in_progress', 'diagnostics', 'approved', 'repairing', 'done', 'canceled'];
const STATUS_LABEL = {
  new: 'Новая', in_progress: 'В работе', diagnostics: 'Диагностика',
  approved: 'Согласована', repairing: 'Ремонт', done: 'Готово', canceled: 'Отменена',
};

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [masters, setMasters] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [error, setError] = useState('');

  const load = () => {
    const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/admin/repairs', { params: query }).then(({ data }) => setRepairs(data));
  };

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'master' } })
      .then(({ data }) => setMasters(data));
  }, []);

  useEffect(() => { load(); }, [filters]);

  const update = async (id, payload) => {
    try {
      await api.put(`/admin/repairs/${id}`, payload);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  const remove = async id => {
    if (!confirm('Удалить заявку?')) return;
    try {
      await api.delete(`/admin/repairs/${id}`);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input placeholder="Поиск по устройству или описанию"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {repairs.map(r => (
          <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">
                #{r.id} — {r.device?.brand} {r.device?.model}
              </span>
              <select value={r.status}
                onChange={e => update(r.id, { status: e.target.value })}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>

            <p className="text-sm text-slate-600 mb-2">{r.description}</p>
            <p className="text-xs text-slate-500 mb-3">
              Заказчик: {r.buyer?.last_name} {r.buyer?.first_name} • {r.buyer?.email}
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-xs text-slate-500">Мастер:</label>
              <select value={r.master_id || ''}
                onChange={e => update(r.id, { master_id: e.target.value ? Number(e.target.value) : null })}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                <option value="">— не назначен —</option>
                {masters.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.last_name} {m.first_name}
                  </option>
                ))}
              </select>

              <label className="text-xs text-slate-500 ml-4">Цена:</label>
              <input type="number" defaultValue={r.price || ''}
                onBlur={e => {
                  const v = e.target.value;
                  if (v !== '' && Number(v) !== Number(r.price)) update(r.id, { price: Number(v) });
                }}
                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm" />

              <button onClick={() => remove(r.id)}
                className="ml-auto text-sm text-red-600 hover:underline">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}