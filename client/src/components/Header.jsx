import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  {user?.role === 'admin' && (
  <Link to="/admin" className="hover:text-sky-400">Админ</Link>
)}

  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold">Технолоджи</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/catalog" className="hover:text-sky-400">Каталог</Link>
          <Link to="/repair" className="hover:text-sky-400">Ремонт</Link>
          {user?.role === 'seller' && (
            <Link to="/seller" className="hover:text-sky-400">Панель продавца</Link>
          )}
          {user?.role === 'master' && (
            <Link to="/master" className="hover:text-sky-400">Панель мастера</Link>
          )}
          {user && (
            <Link to="/my-repairs" className="hover:text-sky-400">Мои заявки</Link>
          )}
          {user && (
            <Link to="/my-orders" className="hover:text-sky-400">Заказы</Link>
          )}
          <Link to="/cart" className="relative hover:text-sky-400">
            Корзина
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-sky-500 text-xs rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </Link>
          {user?.role === 'admin' && (
  <Link to="/admin" className="hover:text-sky-400">Админ</Link>
)}
          {user ? (
            <>
              <Link to="/profile" className="hover:text-sky-400">
                {user.last_name} {user.first_name?.[0]}.
              </Link>
              <button onClick={logout} className="text-slate-300 hover:text-white">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md bg-sky-500 px-4 py-2 hover:bg-sky-600">
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}