import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Главный баннер */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Маркетплейс электроники <br />
          <span className="text-sky-500">«Технолоджи»</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Покупайте новую и б/у технику, а также заказывайте диагностику и ремонт 
          у проверенных мастеров — всё в одном месте.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/catalog" 
            className="rounded-md bg-sky-500 px-8 py-3 text-white font-medium hover:bg-sky-600 transition shadow-sm"
          >
            Перейти в каталог
          </Link>
          <Link 
            to="/repair" 
            className="rounded-md border border-slate-300 bg-white px-8 py-3 font-medium hover:bg-slate-100 transition shadow-sm"
          >
            Заказать ремонт
          </Link>
        </div>
      </section>

      {/* Преимущества */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid gap-6 md:grid-cols-3">
        {[
          { title: 'Проверенные продавцы', text: 'Рейтинги и отзывы помогают выбрать надёжного партнёра.' },
          { title: 'Сервисные мастера', text: 'Диагностика, ремонт и замена комплектующих по прозрачным ценам.' },
          { title: 'Единый личный кабинет', text: 'История покупок и заявок на ремонт в одном месте.' },
        ].map(item => (
          <div key={item.title} className="rounded-xl bg-white p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-3 text-slate-600 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}