import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { getImageUrl } from '../../utils/imageHelper.js';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  
  const [tab, setTab] = useState('list'); // 'list' или 'add'
  const [form, setForm] = useState({
    title: '', description: '', brand: '', price: '',
    condition: 'new', category_id: '', image_url: '', stock: 1, seller_id: ''
  });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => {
    api.get('/admin/products').then(({ data }) => setProducts(data));
  };

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
    api.get('/admin/users', { params: { role: 'seller' } }).then(({ data }) => setSellers(data));
    load();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, image_url: data.url });
    } catch (err) {
      setError('Ошибка загрузки изображения');
    } finally {
      setUploading(false);
    }
  };

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
        condition: 'new', category_id: '', image_url: '', stock: 1, seller_id: ''
      });
      setTab('list');
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
      seller_id: p.seller_id
    });
    setTab('add');
  };

  const remove = async id => {
    if (!confirm('Удалить товар?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  return (
    <div>
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button onClick={() => { setTab('list'); setEditing(null); }}
          className={`px-4 py-2 text-sm ${tab === 'list' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600'}`}>
          Список товаров
        </button>
        <button onClick={() => { setTab('add'); setEditing(null); setForm({ title: '', description: '', brand: '', price: '', condition: 'new', category_id: '', image_url: '', stock: 1, seller_id: '' }); }}
          className={`px-4 py-2 text-sm ${tab === 'add' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600'}`}>
          {editing ? 'Редактировать товар' : 'Добавить товар'}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {tab === 'list' && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-3">Фото</th>
                <th className="px-4 py-3">Товар</th>
                <th className="px-4 py-3">Цена</th>
                <th className="px-4 py-3">Продавец</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <img src={getImageUrl(p.image_url, 'https://placehold.co/50x50?text=Нет')} 
                         alt={p.title} className="w-10 h-10 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/product/${p.id}`} className="hover:underline font-medium">{p.title}</Link>
                  </td>
                  <td className="px-4 py-3">{Number(p.price).toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3">
                    {p.seller?.last_name} {p.seller?.first_name}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => startEdit(p)} className="text-sm text-sky-600 hover:underline">Изменить</button>
                    <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'add' && (
        <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-sm grid gap-4 md:grid-cols-2">
          <input name="title" value={form.title} onChange={handleChange} required
            placeholder="Название" className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2" />
          
          <select name="seller_id" value={form.seller_id} onChange={handleChange} required
            className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2">
            <option value="">Выберите продавца (владельца товара)</option>
            {sellers.map(s => (
              <option key={s.id} value={s.id}>{s.last_name} {s.first_name} ({s.email})</option>
            ))}
          </select>

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

          {/* Блок загрузки картинки */}
          <div className="md:col-span-2 flex items-center gap-4 p-4 border border-slate-200 rounded-md bg-slate-50">
            {form.image_url ? (
              <img src={getImageUrl(form.image_url)} alt="Обложка" className="w-20 h-20 object-cover rounded-md border" />
            ) : (
              <div className="w-20 h-20 bg-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs text-center p-2">Нет фото</div>
            )}
            <div>
              <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition inline-block shadow-sm">
                {uploading ? 'Загрузка...' : 'Загрузить обложку'}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
              <p className="text-xs text-slate-500 mt-2">JPG, PNG до 5 МБ</p>
            </div>
          </div>

          <textarea name="description" value={form.description} onChange={handleChange}
            rows={4} placeholder="Описание"
            className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2" />

          <button type="submit"
            className="md:col-span-2 rounded-md bg-sky-500 py-3 text-white font-medium hover:bg-sky-600">
            {editing ? 'Сохранить изменения' : 'Добавить товар'}
          </button>
        </form>
      )}
    </div>
  );
}