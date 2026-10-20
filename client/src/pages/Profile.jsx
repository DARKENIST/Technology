import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    last_name: '', first_name: '', middle_name: '',
    email: '', phone: '', city: '', bio: '', avatar_url: '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    api.get('/profile/me')
      .then(({ data }) => {
        setUser(data);
        setForm({
          last_name:   data.last_name   || '',
          first_name:  data.first_name  || '',
          middle_name: data.middle_name || '',
          email:       data.email       || '',
          phone:       data.phone       || '',
          city:        data.city        || '',
          bio:         data.bio         || '',
          avatar_url:  data.avatar_url  || '',
        });
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassword = e => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const saveProfile = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const { data } = await api.put('/profile/me', form);
      setUser(data);
      setMessage('Профиль обновлён');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const savePassword = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.put('/profile/me/password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Пароль изменён');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка смены пароля');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="p-8 text-center text-slate-500">Загрузка…</div>;

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold">Технолоджи</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-slate-300 hover:text-white">Главная</Link>
            <button onClick={logout} className="text-slate-300 hover:text-white">Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-6 mb-8">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="avatar"
              className="w-24 h-24 rounded-full object-cover bg-slate-200" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-bold">
              {initials || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {user.last_name} {user.first_name} {user.middle_name || ''}
            </h1>
            <p className="text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 rounded-full bg-sky-100 text-sky-700 text-xs px-3 py-1">
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setTab('profile')}
            className={`px-4 py-2 text-sm ${tab === 'profile' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600'}`}
          >
            Профиль
          </button>
          <button
            onClick={() => setTab('password')}
            className={`px-4 py-2 text-sm ${tab === 'password' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-600'}`}
          >
            Пароль
          </button>
        </div>

        {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
            <input name="last_name" value={form.last_name} onChange={handleChange}
              placeholder="Фамилия" required
              className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="first_name" value={form.first_name} onChange={handleChange}
              placeholder="Имя" required
              className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="middle_name" value={form.middle_name} onChange={handleChange}
              placeholder="Отчество"
              className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="Email" required
              className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder="Телефон"
              className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="city" value={form.city} onChange={handleChange}
              placeholder="Город"
              className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="avatar_url" value={form.avatar_url} onChange={handleChange}
              placeholder="Ссылка на аватар"
              className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2" />
            <textarea name="bio" value={form.bio} onChange={handleChange}
              placeholder="О себе" rows={4}
              className="md:col-span-2 rounded-md border border-slate-300 px-4 py-2" />
            <button type="submit"
              className="md:col-span-2 rounded-md bg-sky-500 py-2 text-white font-medium hover:bg-sky-600">
              Сохранить
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={savePassword} className="grid gap-4 max-w-md">
            <input name="currentPassword" type="password" value={passwords.currentPassword}
              onChange={handlePassword} placeholder="Текущий пароль" required
              className="rounded-md border border-slate-300 px-4 py-2" />
            <input name="newPassword" type="password" value={passwords.newPassword}
              onChange={handlePassword} placeholder="Новый пароль" required
              className="rounded-md border border-slate-300 px-4 py-2" />
            <button type="submit"
              className="rounded-md bg-sky-500 py-2 text-white font-medium hover:bg-sky-600">
              Сменить пароль
            </button>
          </form>
        )}
      </div>
    </div>
  );
}