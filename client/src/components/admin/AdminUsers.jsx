import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const ROLES = ['buyer', 'seller', 'master', 'admin'];
const ROLE_LABEL = { buyer: 'Покупатель', seller: 'Продавец', master: 'Мастер', admin: 'Админ' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: '', blocked: '', search: '' });
  const [error, setError] = useState('');

  const load = () => {
    const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/admin/users', { params: query })
      .then(({ data }) => setUsers(data))
      .catch(e => setError(e.response?.data?.message || 'Ошибка'));
  };

  useEffect(() => { load(); }, [filters]);

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  const toggleBlock = async (user) => {
    const reason = !user.is_blocked
      ? prompt('Причина блокировки:', '') || ''
      : '';
    try {
      await api.put(`/admin/users/${user.id}/block`, {
        is_blocked: !user.is_blocked,
        reason,
      });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  const remove = async (id) => {
    if (!confirm('Удалить пользователя?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Ошибка'); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input placeholder="Поиск по ФИО или email"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select value={filters.role}
          onChange={e => setFilters({ ...filters, role: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Все роли</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <select value={filters.blocked}
          onChange={e => setFilters({ ...filters, blocked: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Все</option>
          <option value="false">Активные</option>
          <option value="true">Заблокированные</option>
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">ФИО</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3">
                  {u.last_name} {u.first_name} {u.middle_name || ''}
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <select value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {u.is_blocked
                    ? <span className="text-red-600">Заблокирован</span>
                    : <span className="text-green-600">Активен</span>}
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => toggleBlock(u)}
                    className="text-sm text-amber-600 hover:underline">
                    {u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                  </button>
                  <button onClick={() => remove(u.id)}
                    className="text-sm text-red-600 hover:underline">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}