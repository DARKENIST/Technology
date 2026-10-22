import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';
import { getImageUrl } from '../utils/imageHelper.js';

export default function Favorites() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/favorites').then(({ data }) => setProducts(data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Избранное</h1>
        {products.length === 0 ? <p className="text-slate-500">Вы пока ничего не добавили.</p> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                <img src={getImageUrl(p.image_url)} alt={p.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{p.title}</h3>
                  <p className="text-lg font-bold text-sky-600 mt-2">{Number(p.price).toLocaleString('ru-RU')} ₽</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}