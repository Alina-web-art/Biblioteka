import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Employee } from '../types';
import { fetchBooks, fetchEmployees, submitRequest } from '../api';
import { Book, ArrowLeft, User, Users, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function RequestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookParam = searchParams.get('book');
  const actionParam = searchParams.get('action') as 'take' | 'return' | null;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [bookNumber, setBookNumber] = useState('');

  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [bookId, setBookId] = useState<number | ''>(bookParam ? parseInt(bookParam) : '');
  const [action, setAction] = useState<'take' | 'return'>(actionParam || 'take');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEmployees().then(setEmployees);
    if (bookParam) {
      fetchBooks().then(books => {
        const book = books.find(b => b.id === parseInt(bookParam));
        if (book) {
          setBookTitle(book.title);
          setBookNumber(book.number);
          setBookId(book.id);
        }
      });
    }
  }, [bookParam]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!bookId) {
      errors.bookId = 'Укажите номер книги';
    }

    if (isEmployee === null) {
      errors.isEmployee = 'Выберите один из вариантов';
    }

    if (isEmployee === true && !employeeId) {
      errors.employeeId = 'Выберите сотрудника из списка';
    }

    if (isEmployee === false) {
      if (!fullName || fullName.trim().length < 3) {
        errors.fullName = 'ФИО должно содержать не менее 3 символов';
      } else if (fullName.trim().length > 200) {
        errors.fullName = 'ФИО не должно превышать 200 символов';
      }
      if (!position || position.trim().length < 2) {
        errors.position = 'Должность должна содержать не менее 2 символов';
      } else if (position.trim().length > 150) {
        errors.position = 'Должность не должна превышать 150 символов';
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Укажите корректный адрес электронной почты';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const response = await submitRequest({
        bookId: Number(bookId),
        action,
        isEmployee: isEmployee!,
        employeeId: isEmployee ? Number(employeeId) : undefined,
        fullName: !isEmployee ? fullName.trim() : undefined,
        position: !isEmployee ? position.trim() : undefined,
        email: !isEmployee ? email.trim() : undefined,
      });

      if (response.ok) {
        setSuccess(response.message!);
      } else {
        setError(response.error || 'Не удалось отправить заявку, попробуйте через минуту');
      }
    } catch {
      setError('Не удалось отправить заявку, попробуйте через минуту');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Заявка отправлена</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{success}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowLeft size={16} /> Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} /> Назад в каталог
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Заявка на книгу</h1>
          <p className="text-sm text-gray-500 mb-6">Заполните форму для оформления заявки</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Book info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Book className="text-indigo-600" size={20} />
                <h3 className="text-sm font-semibold text-gray-700">Информация о книге</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Номер книги</label>
                  {bookParam ? (
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700">
                      {bookNumber || bookParam}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={bookId}
                      onChange={e => setBookId(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Введите номер"
                    />
                  )}
                  {fieldErrors.bookId && <p className="text-xs text-red-500 mt-1">{fieldErrors.bookId}</p>}
                </div>
                {bookTitle && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Название</label>
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                      {bookTitle}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Действие</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAction('take')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
                    action === 'take'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Взять книгу
                </button>
                <button
                  type="button"
                  onClick={() => setAction('return')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
                    action === 'return'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Вернуть книгу
                </button>
              </div>
            </div>

            {/* Employee toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Вы сотрудник портала Битрикс24?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmployee(true)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                    isEmployee === true
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Users size={16} /> Да
                </button>
                <button
                  type="button"
                  onClick={() => setIsEmployee(false)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                    isEmployee === false
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <User size={16} /> Нет
                </button>
              </div>
              {fieldErrors.isEmployee && <p className="text-xs text-red-500 mt-1">{fieldErrors.isEmployee}</p>}
            </div>

            {/* Employee fields */}
            {isEmployee === true && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Сотрудник</label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Выберите сотрудника…</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                {fieldErrors.employeeId && <p className="text-xs text-red-500 mt-1">{fieldErrors.employeeId}</p>}
              </div>
            )}

            {/* Guest fields */}
            {isEmployee === false && (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      fieldErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Иванов Иван Иванович"
                  />
                  {fieldErrors.fullName && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                  <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      fieldErrors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Менеджер"
                  />
                  {fieldErrors.position && <p className="text-xs text-red-500 mt-1">{fieldErrors.position}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Электронная почта</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="example@mail.ru"
                  />
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Отправка…
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Отправить заявку
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
