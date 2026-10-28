import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Поля карты (имитация)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });

  useEffect(() => {
    // Загружаем информацию о заказе, чтобы показать сумму
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Заказ не найден'));
  }, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    
    // Имитация задержки банковской сети (1.5 секунды)
    setTimeout(async () => {
      try {
        // Отправляем запрос на сервер для смены статуса
        await api.put(`/orders/${id}/pay`); 
        // Перенаправляем в мои заказы
        navigate('/my-orders');
      } catch (err) {
        setError('Ошибка проведения платежа. Попробуйте еще раз.');
        setProcessing(false);
      }
    }, 1500);
  };

  if (!order && !error) return <div className="p-8 text-center text-slate-500">Загрузка данных...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        
        {/* Логотип и заголовок */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-slate-800 tracking-wider mb-1">БЕЗОПАСНАЯ ОПЛАТА</div>
          <p className="text-sm text-slate-500">Заказ №{order.id}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
          <p className="text-center text-slate-600 mb-1">Сумма к оплате:</p>
          <p className="text-center text-3xl font-bold text-slate-900">
            {Number(order.total).toLocaleString('ru-RU')} ₽
          </p>
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Номер карты</label>
            <input 
              placeholder="0000 0000 0000 0000" 
              maxLength="19" 
              required
              className="w-full border border-slate-300 p-3 rounded-md focus:outline-none focus:border-sky-500 font-mono text-lg"
              onChange={e => setCard({...card, number: e.target.value})}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs text-slate-500 mb-1">Срок действия</label>
              <input 
                placeholder="ММ/ГГ" 
                maxLength="5" 
                required 
                className="w-full border border-slate-300 p-3 rounded-md focus:outline-none focus:border-sky-500 font-mono text-lg" 
                onChange={e => setCard({...card, expiry: e.target.value})}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs text-slate-500 mb-1">CVC</label>
              <input 
                placeholder="•••" 
                maxLength="3" 
                type="password" 
                required 
                className="w-full border border-slate-300 p-3 rounded-md focus:outline-none focus:border-sky-500 font-mono text-lg"
                onChange={e => setCard({...card, cvv: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={processing}
            className="w-full mt-6 bg-green-500 text-white font-bold text-lg py-4 rounded-md hover:bg-green-600 disabled:opacity-50 transition shadow-sm"
          >
            {processing ? 'Обработка платежа...' : 'Оплатить'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/my-orders" className="text-sm text-slate-400 hover:text-slate-600 hover:underline">
            Отменить и вернуться
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-center text-slate-400 flex items-center justify-center gap-1">
          <span>🔒 Тестовый режим. Введите любые цифры.</span>
        </div>
      </div>
    </div>
  );
}