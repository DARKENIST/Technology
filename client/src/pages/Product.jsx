import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';
import { getImageUrl } from '../utils/imageHelper.js'; 

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // сам товар
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
    // отзывы на этот товар
    api.get(`/reviews/product/${id}`).then(({ data }) => setReviews(data)).catch(() => {});
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.product_id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({
      product_id: product.id,
      title: product.title,
      price: Number(product.price),
      image_url: product.image_url,
      quantity: 1,
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setMessage('Добавлено в корзину');
    setTimeout(() => setMessage(''), 2000);
  };

  if (!product) return <div className="p-8 text-center text-slate-500">Загрузка…</div>;

  // Вычисляем средний рейтинг
  const avgRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/catalog" className="text-sm text-sky-600 hover:underline">← Назад в каталог</Link>

        <div className="mt-4 grid gap-8 md:grid-cols-2">
          {/* Картинка товара */}
          <img 
            src={getImageUrl(product.image_url, 'https://placehold.co/600x400?text=Нет+фото')}
            alt={product.title} 
            className="w-full rounded-lg object-cover bg-white shadow-sm" 
          />

          {/* Информация о товаре */}
          <div>
            <p className="text-sm text-slate-500">{product.category?.name}</p>
            <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
            
            {/* Рейтинг */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-amber-500 text-lg">
                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
              </span>
              <span className="text-sm text-slate-500">
                {avgRating} ({reviews.length} отзывов)
              </span>
            </div>

            <p className="text-3xl font-bold text-sky-600 mt-4">
              {Number(product.price).toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-sm mt-2 text-slate-600">
              Состояние: {product.condition === 'new' ? 'Новый' : 'Б/у'} • В наличии: {product.stock} шт.
            </p>

            <p className="mt-6 text-slate-700 whitespace-pre-wrap">{product.description}</p>

            <div className="mt-6 rounded-lg bg-white p-4 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Продавец</p>
              <p className="font-medium mt-1">
                {product.seller?.last_name} {product.seller?.first_name}
                {product.seller?.city && ` • ${product.seller.city}`}
              </p>
            </div>

            <button 
              onClick={addToCart} 
              disabled={product.stock < 1}
              className="mt-6 w-full rounded-md bg-sky-500 py-3 text-white font-medium hover:bg-sky-600 disabled:opacity-50 transition shadow-sm"
            >
              {product.stock < 1 ? 'Нет в наличии' : 'В корзину'}
            </button>

            {message && <p className="mt-3 text-sm text-green-600 font-medium">{message}</p>}
          </div>
        </div>

        {/* Блок с отзывами */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-6">Отзывы покупателей</h2>
          {reviews.length === 0 ? (
            <p className="text-slate-500">Пока нет отзывов. Купите товар и оставьте первый отзыв!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-amber-500">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                    <span className="font-medium text-sm">
                      {r.author?.first_name} {r.author?.last_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}