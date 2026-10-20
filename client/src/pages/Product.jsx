import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/catalog" className="text-sm text-sky-600 hover:underline">← Назад в каталог</Link>

        <div className="mt-4 grid gap-8 md:grid-cols-2">
          <img src={product.image_url || 'https://picsum.photos/seed/' + product.id + '/600/400'}
            alt={product.title} className="w-full rounded-lg object-cover" />

          <div>
            <p className="text-sm text-slate-500">{product.category?.name}</p>
            <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
            <p className="text-3xl font-bold text-sky-600 mt-4">
              {Number(product.price).toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-sm mt-2 text-slate-600">
              Состояние: {product.condition === 'new' ? 'Новый' : 'Б/у'} • В наличии: {product.stock}
            </p>

            <p className="mt-4 text-slate-700">{product.description}</p>

            <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Продавец</p>
              <p className="font-medium">
                {product.seller?.last_name} {product.seller?.first_name}
                {product.seller?.city && ` • ${product.seller.city}`}
              </p>
            </div>

            <button onClick={addToCart} disabled={product.stock < 1}
              className="mt-6 w-full rounded-md bg-sky-500 py-3 text-white font-medium hover:bg-sky-600 disabled:opacity-50">
              {product.stock < 1 ? 'Нет в наличии' : 'В корзину'}
            </button>

            {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}