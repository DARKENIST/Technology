import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/categories').then(({ data }) => setItems(data));

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/admin/categories/${editing}`, form);
      else         await api.post('/admin/categories', form);
      setForm({ name: '', slug: '' });
      setEditing(null);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  const remove = async id => {
    if (!confirm('Удалить категорию?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <form onSubmit={submit} className="bg-white p-5 rounded-lg shadow-sm space-y-3 h-fit">
        <h2 className="font-semibold">{editing ? 'Изменить категорию' : 'Новая категория'}</h2>
        <input placeholder="Название" value={form.name} required
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="Slug (латиница)" value={form.slug} required
          onChange={e => setForm({ ...form, slug: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit"
          className="w-full rounded-md bg-sky-500 py-2 text-white hover:bg-sky-600">
          {editing ? 'Сохранить' : 'Создать'}
        </button>
        {editing && (
          <button type="button"
            onClick={() => { setEditing(null); setForm({ name: '', slug: '' }); }}
            className="w-full text-sm text-slate-500 hover:underline">
            Отменить
          </button>
        )}
      </form>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{c.id}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.slug}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => { setEditing(c.id); setForm({ name: c.name, slug: c.slug }); }}
                    className="text-sm text-sky-600 hover:underline">Изменить</button>
                  <button onClick={() => remove(c.id)}
                    className="text-sm text-red-600 hover:underline">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}