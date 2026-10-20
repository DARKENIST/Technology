import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';

export default function SellerPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, sold: 0, revenue: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('products');
  const [form, setForm] = useState({
    title: '', description: '', brand: '', price: '',
    condition: 'new', category_id: '', image_url: '', stock: 1,
  });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/seller/products').then(({ data }) => setProducts(data));
    api.get('/seller/orders').then(({ data }) => setOrders(data));
    api.get('/seller/stats').then(({ data }) => setStats(data));
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !['seller','admin'].includes(user.role)) return navigate('/login');
    load();
    api.get('/categories').then(({ data }) => setCategories(data));
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
        setEditing(null);
      } else {
        await api.post('/products', form);
      }
      setForm({
        title: '', description: '', brand: '', price: '',
        condition: 'new', category_id: '', image_url: '', stock: 1,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const startEdit = p => {
    setEditing(p.id);
    setForm({
      title: p.title, description: p.description || '',
      brand: p.brand || '', price: p.price,
      condition: p.condition, category_id: p.category_id,
      image_url: p.image_url || '', stock: p.stock,
    });
    setTab('add');
  };

  const remove = async id => {
    if (!confirm('Удалить товар?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Панель продавца</h1>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Товаров</p>
            <p className="text-2xl font-bold">{stats.products}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Продано единиц</p>
            <p className="text-2xl font-bold">{stats.sold}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Выручка</p>
            <p className="text-2xl font-bold text-sky-600">
              {stats.revenue.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button onClick={() => setTab('products')}
            className={`px-4 py-2 text-sm ${tab === 'products' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600'}`}>
            Мои товары
          </button>
          <button onClick={() => setTab('orders')}
            className={`px-4 py-2 text-sm ${tab === 'orders' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600'}`}>
            Заказы
          </button>
          <button onClick={() => setTab('add')}
            className={`px-4 py-2 text-sm ${tab === 'add' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600'}`}>
            {editing ? 'Редактирование' : 'Добавить товар'}
          </button>
        </div>

        {tab === 'products' && (
          <div className="space-y-3">
            {products.length === 0 ? (
              <p className="text-slate-500">Товаров нет.</p>
            ) : products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                <img src={p.image_url || 'https://picsum.photos/seed/' + p.id + '/80/80'}
                  className="w-16 h-16 object-cover rounded" alt={p.title} />
                <div className="flex-1">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-slate-500">
                    {Number(p.price).toLocaleString('ru-RU')} ₽ • {p.stock} шт.
                  </p>
                </div>
                <button onClick={() => startEdit(p)}
                  className="text-sky-600 text-sm hover:underline">Изменить</button>
                <button onClick={() => remove(p.id)}
                  className="text-red-500 text-sm hover:underline">Удалить</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-slate-500">Заказов пока нет.</p>
            ) : orders.map(o => (
              <div key={o.order.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Заказ №{o.order.id}</span>
                  <span className="text-sm text-slate-500">{o.order.status}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  {o.order.buyer?.last_name} {o.order.buyer?.first_name} • {o.order.buyer?.phone}
                </p>
                <p className="text-xs text-slate-500 mb-2">Адрес: {o.order.address}</p>
                <ul className="space-y-1 text-sm">
                  {o.items.map(i => (
                    <li key={i.id}>{i.product?.title} × {i.quantity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === 'add' && (
          <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-sm grid gap-4 md:grid-cols-2">
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="Название" className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2" />
            <input name="brand" value={form.brand} onChange={handleChange}
              placeholder="Бренд" className="rounded-md border border-slate-300 px-4 py-2" />
            <select name="category_id" value={form.category_id} onChange={handleChange} required
              className="rounded-md border border-slate-300 px-4 py-2">
              <option value="">Категория</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input name="price" type="number" value={form.price} onChange={handleChange} required
              placeholder="Цена" className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="stock" type="number" value={form.stock} onChange={handleChange}
              placeholder="В наличии" className="rounded-md border border-slate-300 px-4 py-2" />
            <select name="condition" value={form.condition} onChange={handleChange}
              className="rounded-md border border-slate-300 px-4 py-2">
              <option value="new">Новый</option>
              <option value="used">Б/у</option>
            </select>
            <input name="image_url" value={form.image_url} onChange={handleChange}
              placeholder="Ссылка на изображение"
              className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2" />
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={4} placeholder="Описание"
              className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2" />

            {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}

            <button type="submit"
              className="md:col-span-2 rounded-md bg-sky-500 py-3 text-white font-medium hover:bg-sky-600">
              {editing ? 'Сохранить изменения' : 'Добавить товар'}
            </button>
            {editing && (
              <button type="button"
                onClick={() => { setEditing(null); setForm({
                  title: '', description: '', brand: '', price: '',
                  condition: 'new', category_id: '', image_url: '', stock: 1,
                }); }}
                className="md:col-span-2 text-sm text-slate-500 hover:underline">
                Отменить редактирование
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}