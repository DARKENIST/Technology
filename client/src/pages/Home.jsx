import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Технолоджи</h1>
          <nav className="flex items-center gap-6">
            <Link to="/" className="hover:text-sky-400">Главная</Link>
            <Link to="/catalog" className="hover:text-sky-400">Каталог</Link>
            <Link to="/repair" className="hover:text-sky-400">Ремонт</Link>
            <Link
              to="/login"
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium hover:bg-sky-600"
            >
              Войти
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900">
          Маркетплейс электроники с сервисом ремонта
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Покупайте новую и б/у технику, заказывайте диагностику и ремонт
          у проверенных мастеров — всё в одном месте.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/catalog"
            className="rounded-md bg-sky-500 px-6 py-3 text-white font-medium hover:bg-sky-600"
          >
            Перейти в каталог
          </Link>
          <Link
            to="/repair"
            className="rounded-md border border-slate-300 px-6 py-3 font-medium hover:bg-slate-100"
          >
            Заказать ремонт
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 grid gap-6 md:grid-cols-3">
        {[
          { title: 'Проверенные продавцы', text: 'Рейтинги и отзывы помогают выбрать надёжного партнёра.' },
          { title: 'Сервисные мастера', text: 'Диагностика, ремонт и замена комплектующих по прозрачным ценам.' },
          { title: 'Единый личный кабинет', text: 'История покупок и заявок на ремонт в одном месте.' },
        ].map(item => (
          <div key={item.title} className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-slate-600">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}