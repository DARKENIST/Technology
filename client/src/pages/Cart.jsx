import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const save = (next) => {
    localStorage.setItem('cart', JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQty = (id, q) => {
    if (q < 1) return;
    save(items.map(i => i.product_id === id ? { ...i, quantity: q } : i));
  };

  const remove = (id) => save(items.filter(i => i.product_id !== id));

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Корзина</h1>

        {items.length === 0 ? (
          <p className="text-slate-500">Корзина пуста. <Link to="/catalog" className="text-sky-600">Перейти в каталог</Link></p>
        ) : (
          <>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product_id} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
                  <img src={item.image_url || 'https://picsum.photos/seed/' + item.product_id + '/100/100'}
                    className="w-16 h-16 object-cover rounded" alt={item.title} />
                  <div className="flex-1">
                    <Link to={`/product/${item.product_id}`} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                    <p className="text-sm text-slate-500">{item.price.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <input type="number" min="1" value={item.quantity}
                    onChange={e => updateQty(item.product_id, Number(e.target.value))}
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center" />
                  <p className="w-24 text-right font-medium">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </p>
                  <button onClick={() => remove(item.product_id)}
                    className="text-red-500 text-sm hover:underline">Удалить</button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <span className="text-lg font-bold">Итого: {total.toLocaleString('ru-RU')} ₽</span>
              <button onClick={() => navigate('/checkout')}
                className="rounded-md bg-sky-500 px-6 py-2 text-white font-medium hover:bg-sky-600">
                Оформить заказ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}