import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { api } from '../api.js';

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    address: '', phone: '', payment_method: 'card', comment: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        address: form.address,
        phone: form.phone,
        payment_method: form.payment_method,
        comment: form.comment,
      };
      await api.post('/orders', payload);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      navigate('/my-orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка оформления');
    }
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <p className="max-w-4xl mx-auto px-6 py-8 text-slate-500">Корзина пуста.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h1 className="text-xl font-bold">Оформление заказа</h1>

          <input name="address" value={form.address} onChange={handleChange} required
            placeholder="Адрес доставки"
            className="w-full rounded-md border border-slate-300 px-4 py-2" />

          <input name="phone" value={form.phone} onChange={handleChange} required
            placeholder="Телефон"
            className="w-full rounded-md border border-slate-300 px-4 py-2" />

          <select name="payment_method" value={form.payment_method} onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-4 py-2">
            <option value="card">Банковская карта</option>
            <option value="cash">Наличными при получении</option>
            <option value="online">Онлайн-оплата</option>
          </select>

          <textarea name="comment" value={form.comment} onChange={handleChange}
            placeholder="Комментарий к заказу" rows={3}
            className="w-full rounded-md border border-slate-300 px-4 py-2" />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit"
            className="w-full rounded-md bg-sky-500 py-3 text-white font-medium hover:bg-sky-600">
            Подтвердить заказ
          </button>
        </form>

        <aside className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="font-semibold mb-3">Ваш заказ</h2>
          <ul className="space-y-2 text-sm">
            {items.map(i => (
              <li key={i.product_id} className="flex justify-between">
                <span className="truncate">{i.title} × {i.quantity}</span>
                <span>{(i.price * i.quantity).toLocaleString('ru-RU')} ₽</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold">
            <span>Итого</span>
            <span>{total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </aside>
      </div>
    </div>
  );
}