import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: params.get('category') || '',
    brand: params.get('brand') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    condition: params.get('condition') || '',
    search: params.get('search') || '',
    sort: params.get('sort') || '',
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    const query = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    );
    api.get('/products', { params: query }).then(({ data }) => setProducts(data));
    setParams(query);
  }, [filters]);

  const update = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="bg-white rounded-lg p-5 shadow-sm h-fit">
          <h2 className="font-semibold mb-4">Фильтры</h2>

          <label className="block text-sm mb-1">Поиск</label>
          <input value={filters.search} onChange={e => update('search', e.target.value)}
            placeholder="Название или бренд"
            className="w-full rounded-md border border-slate-300 px-3 py-2 mb-4 text-sm" />

          <label className="block text-sm mb-1">Категория</label>
          <select value={filters.category} onChange={e => update('category', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 mb-4 text-sm">
            <option value="">Все</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label className="block text-sm mb-1">Состояние</label>
          <select value={filters.condition} onChange={e => update('condition', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 mb-4 text-sm">
            <option value="">Любое</option>
            <option value="new">Новый</option>
            <option value="used">Б/у</option>
          </select>

          <label className="block text-sm mb-1">Цена</label>
          <div className="flex gap-2 mb-4">
            <input type="number" placeholder="от" value={filters.minPrice}
              onChange={e => update('minPrice', e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="до" value={filters.maxPrice}
              onChange={e => update('maxPrice', e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <label className="block text-sm mb-1">Сортировка</label>
          <select value={filters.sort} onChange={e => update('sort', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">По дате</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
          </select>

          <button onClick={() => setFilters({
            category: '', brand: '', minPrice: '', maxPrice: '',
            condition: '', search: '', sort: '',
          })} className="w-full mt-4 text-sm text-sky-600 hover:underline">
            Сбросить
          </button>
        </aside>

        <section>
          <h1 className="text-2xl font-bold mb-4">Каталог товаров</h1>
          {products.length === 0 ? (
            <p className="text-slate-500">Ничего не найдено.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(p => (
                <Link key={p.id} to={`/product/${p.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                  <img src={p.image_url || 'https://picsum.photos/seed/' + p.id + '/400/300'}
                    alt={p.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <p className="text-xs text-slate-500">{p.category?.name}</p>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {p.condition === 'new' ? 'Новый' : 'Б/у'}
                    </p>
                    <p className="text-lg font-bold text-sky-600 mt-2">
                      {Number(p.price).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}