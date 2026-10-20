import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    last_name: '', first_name: '', middle_name: '',
    email: '', password: '', role: 'buyer',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(url, form);

      if (mode === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/profile');
      } else {
        setMode('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка запроса');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Технолоджи</h1>
        <p className="mt-1 text-center text-slate-500">
          {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <>
              <input name="last_name" placeholder="Фамилия"
                value={form.last_name} onChange={handleChange} required
                className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none" />
              <input name="first_name" placeholder="Имя"
                value={form.first_name} onChange={handleChange} required
                className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none" />
              <input name="middle_name" placeholder="Отчество (при наличии)"
                value={form.middle_name} onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none" />
            </>
          )}

          <input type="email" name="email" placeholder="Email"
            value={form.email} onChange={handleChange} required
            className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none" />

          <input type="password" name="password" placeholder="Пароль"
            value={form.password} onChange={handleChange} required
            className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none" />

          {mode === 'register' && (
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-sky-500 focus:outline-none">
              <option value="buyer">Покупатель</option>
              <option value="seller">Продавец</option>
              <option value="master">Мастер по ремонту</option>
            </select>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit"
            className="w-full rounded-md bg-sky-500 py-2 font-medium text-white hover:bg-sky-600">
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sky-600 hover:underline">
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-slate-500 hover:underline">← На главную</Link>
        </p>
      </div>
    </div>
  );
}