import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminReviews() {
  const [items, setItems] = useState([]);

  const load = () => api.get('/admin/reviews').then(({ data }) => setItems(data));

  useEffect(() => { load(); }, []);

  const remove = async id => {
    if (!confirm('Удалить отзыв?')) return;
    await api.delete(`/admin/reviews/${id}`);
    load();
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-slate-500">Отзывов нет.</p>
      ) : items.map(r => (
        <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium">
              {r.author?.last_name} {r.author?.first_name}
              <span className="text-slate-400 mx-2">→</span>
              {r.target?.last_name} {r.target?.first_name}
            </span>
            <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
          </div>
          {r.product && (
            <p className="text-xs text-slate-500 mb-1">Товар: {r.product.title}</p>
          )}
          <p className="text-sm text-slate-700 mb-2">{r.comment}</p>
          <button onClick={() => remove(r.id)}
            className="text-sm text-red-600 hover:underline">Удалить</button>
        </div>
      ))}
    </div>
  );
}