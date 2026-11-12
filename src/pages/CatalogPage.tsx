import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '../types';
import { fetchBooks } from '../api';
import { Search, BookOpen, Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks()
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return books;
    const q = search.toLowerCase().trim();
    return books.filter(
      b => b.number.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [books, search]);

  const lastUpdated = '12.11.2026 09:15';

  const handleAction = (book: Book) => {
    const action = book.available ? 'take' : 'return';
    navigate(`/request?book=${book.id}&action=${action}`);
  };

  const getStatusBadge = (book: Book) => {
    switch (book.status) {
      case 'shelf':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle size={12} /> Свободна
          </span>
        );
      case 'issued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={12} /> Выдана
          </span>
        );
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertTriangle size={12} /> Проверка возврата
          </span>
        );
      case 'repair':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertTriangle size={12} /> На ремонте
          </span>
        );
      case 'written_off':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} /> Списана
          </span>
        );
    }
  };

  const getActionButton = (book: Book) => {
    if (book.status === 'shelf') {
      return (
        <button
          onClick={() => handleAction(book)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          Взять книгу
        </button>
      );
    }
    if (book.status === 'issued') {
      return (
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs text-amber-700 font-medium">{book.dueLabel}</span>
          <button
            onClick={() => handleAction(book)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Вернуть книгу
          </button>
        </div>
      );
    }
    return (
      <span className="text-sm text-gray-500 italic">{book.dueLabel}</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-600">Загрузка каталога…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="text-indigo-600" size={32} />
                Библиотека
              </h1>
              <p className="text-sm text-gray-500 mt-1">Обновлено {lastUpdated}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Данные актуальны
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Поиск по номеру или названию…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Books Table */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">№</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Автор</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{book.number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{book.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
                    <td className="px-6 py-4">{getStatusBadge(book)}</td>
                    <td className="px-6 py-4 text-right">{getActionButton(book)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredBooks.map(book => (
              <div key={book.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-gray-400">№ {book.number}</p>
                    <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                  {getStatusBadge(book)}
                </div>
                <div className="flex justify-end">
                  {getActionButton(book)}
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Search className="mx-auto mb-3 text-gray-300" size={40} />
              <p>Книги не найдены</p>
              <p className="text-sm mt-1">Попробуйте изменить поисковый запрос</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{books.length}</p>
            <p className="text-xs text-gray-500 mt-1">Всего книг</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{books.filter(b => b.status === 'shelf').length}</p>
            <p className="text-xs text-gray-500 mt-1">Свободны</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{books.filter(b => b.status === 'issued').length}</p>
            <p className="text-xs text-gray-500 mt-1">Выданы</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{books.filter(b => !b.available && b.status !== 'issued').length}</p>
            <p className="text-xs text-gray-500 mt-1">Недоступны</p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Как это работает</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-indigo-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Выберите книгу</p>
                <p className="text-xs text-gray-500 mt-0.5">Найдите нужную книгу в каталоге и нажмите «Взять» или «Вернуть»</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-indigo-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Заполните заявку</p>
                <p className="text-xs text-gray-500 mt-0.5">Укажите свои данные или выберите себя из списка сотрудников</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-indigo-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Дождитесь согласования</p>
                <p className="text-xs text-gray-500 mt-0.5">Библиотерь подтвердит выдачу, и вы получите уведомление</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            По вопросам работы библиотеки обращайтесь к <span className="font-medium text-gray-700">Тумановой А.Н.</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">Каталог обновляется автоматически каждые 5 минут</p>
        </div>
      </footer>
    </div>
  );
}
