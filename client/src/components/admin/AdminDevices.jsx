import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminDevices() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: '', brand: '', model: '', release_year: '' });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/devices', { params: filter ? { category: filter } : {} })
    .then(({ data }) => setItems(data));

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => { load(); }, [filter]);

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/admin/devices/${editing}`, form);
      else         await api.post('/admin/devices', form);
      setForm({ category_id: '', brand: '', model: '', release_year: '' });
      setEditing(null);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  const remove = async id => {
    if (!confirm('Удалить устройство?')) return;
    try {
      await api.delete(`/admin/devices/${id}`);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <form onSubmit={submit} className="bg-white p-5 rounded-lg shadow-sm space-y-3 h-fit">
        <h2 className="font-semibold">{editing ? 'Изменить устройство' : 'Новое устройство'}</h2>

        <select value={form.category_id} required
          onChange={e => setForm({ ...form, category_id: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2">
          <option value="">Категория</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <input placeholder="Бренд" value={form.brand} required
          onChange={e => setForm({ ...form, brand: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2" />

        <input placeholder="Модель" value={form.model} required
          onChange={e => setForm({ ...form, model: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2" />

        <input type="number" placeholder="Год выпуска" value={form.release_year}
          onChange={e => setForm({ ...form, release_year: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit"
          className="w-full rounded-md bg-sky-500 py-2 text-white hover:bg-sky-600">
          {editing ? 'Сохранить' : 'Создать'}
        </button>

        {editing && (
          <button type="button"
            onClick={() => { setEditing(null); setForm({ category_id: '', brand: '', model: '', release_year: '' }); }}
            className="w-full text-sm text-slate-500 hover:underline">
            Отменить
          </button>
        )}
      </form>

      <div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="mb-3 rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Все категории</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Устройство</th>
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Год</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(d => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{d.id}</td>
                  <td className="px-4 py-3">{d.brand} {d.model}</td>
                  <td className="px-4 py-3">{d.category?.name}</td>
                  <td className="px-4 py-3">{d.release_year || '—'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => {
                      setEditing(d.id);
                      setForm({
                        category_id: d.category_id, brand: d.brand,
                        model: d.model, release_year: d.release_year || '',
                      });
                    }} className="text-sm text-sky-600 hover:underline">Изменить</button>
                    <button onClick={() => remove(d.id)}
                      className="text-sm text-red-600 hover:underline">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}