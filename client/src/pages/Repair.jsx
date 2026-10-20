import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Header from '../components/Header.jsx';

export default function Repair() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ device_id: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login');
    api.get('/repairs/devices').then(({ data }) => setDevices(data));
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.post('/repairs', form);
      setMessage('Заявка отправлена. Мастер свяжется с вами.');
      setForm({ device_id: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Заявка на ремонт</h1>
        <p className="text-slate-500 mb-6">
          Выберите устройство и опишите неисправность. Мастер свяжется с вами для уточнения деталей.
        </p>

        <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <select name="device_id" value={form.device_id} onChange={handleChange} required
            className="w-full rounded-md border border-slate-300 px-4 py-2">
            <option value="">Выберите устройство</option>
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.brand} {d.model} ({d.category?.name})
              </option>
            ))}
          </select>

          <textarea name="description" value={form.description} onChange={handleChange}
            required rows={5} placeholder="Опишите неисправность"
            className="w-full rounded-md border border-slate-300 px-4 py-2" />

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit"
            className="w-full rounded-md bg-sky-500 py-3 text-white font-medium hover:bg-sky-600">
            Отправить заявку
          </button>
        </form>
      </div>
    </div>
  );
}