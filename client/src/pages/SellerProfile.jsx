import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';
import { getImageUrl } from '../utils/imageHelper.js';

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/users/${id}/products`),
      api.get(`/users/${id}/reviews`)
    ]).then(([sellerRes, productsRes, reviewsRes]) => {
      setSeller(sellerRes.data);
      setProducts(productsRes.data);
      setReviews(reviewsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Загрузка профиля...</div>;
  if (!seller) return <div className="p-8 text-center text-red-500">Продавец не найден</div>;

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Информация о продавце */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center gap-6 mb-8">
          <img 
            src={getImageUrl(seller.avatar_url, `https://ui-avatars.com/api/?name=${seller.last_name}`)} 
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover bg-slate-200" 
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {seller.last_name} {seller.first_name} {seller.middle_name || ''}
            </h1>
            <p className="text-slate-500 mt-1">{seller.city || 'Город не указан'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-amber-500 text-lg">
                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
              </span>
              <span className="text-sm text-slate-500">{avgRating} ({reviews.length} отзывов)</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          {/* Список товаров */}
          <section>
            <h2 className="text-xl font-bold mb-4">Товары продавца</h2>
            {products.length === 0 ? (
              <p className="text-slate-500">У продавца пока нет активных товаров.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {products.map(p => (
                  <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                    <img src={getImageUrl(p.image_url)} alt={p.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <p className="text-xs text-slate-500">{p.category?.name}</p>
                      <h3 className="font-semibold text-slate-900 line-clamp-2 mt-1">{p.title}</h3>
                      <p className="text-lg font-bold text-sky-600 mt-2">{Number(p.price).toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Список отзывов */}
          <aside>
            <h2 className="text-xl font-bold mb-4">Отзывы</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">Пока нет отзывов.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
                      <span className="font-medium">{r.author?.first_name} {r.author?.last_name}</span>
                    </div>
                    <p className="text-slate-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}