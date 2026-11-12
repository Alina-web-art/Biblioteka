import { Book, Employee, RequestPayload, RequestResponse } from './types';

// Mock data simulating Bitrix24 CRM data
const mockBooks: Book[] = [
  { id: 1, number: '0001', title: 'Война и мир', author: 'Л.Н. Толстой', status: 'shelf', available: true },
  { id: 2, number: '0002', title: 'Преступление и наказание', author: 'Ф.М. Достоевский', status: 'issued', dueDate: '25.11.2026', dueLabel: 'У читателя до 25.11.2026', available: false },
  { id: 3, number: '0003', title: 'Мастер и Маргарита', author: 'М.А. Булгаков', status: 'shelf', available: true },
  { id: 4, number: '0004', title: 'Евгений Онегин', author: 'А.С. Пушкин', status: 'checking', dueLabel: 'Недоступна: проверка возврата', available: false },
  { id: 5, number: '0005', title: 'Анна Каренина', author: 'Л.Н. Толстой', status: 'shelf', available: true },
  { id: 6, number: '0006', title: 'Идиот', author: 'Ф.М. Достоевский', status: 'issued', dueDate: '30.11.2026', dueLabel: 'У читателя до 30.11.2026', available: false },
  { id: 7, number: '0007', title: 'Отцы и дети', author: 'И.С. Тургенев', status: 'repair', dueLabel: 'Недоступна: на ремонте', available: false },
  { id: 8, number: '0008', title: 'Герой нашего времени', author: 'М.Ю. Лермонтов', status: 'shelf', available: true },
  { id: 9, number: '0009', title: 'Мёртвые души', author: 'Н.В. Гоголь', status: 'written_off', dueLabel: 'Недоступна: списана', available: false },
  { id: 10, number: '0010', title: 'Бесы', author: 'Ф.М. Достоевский', status: 'shelf', available: true },
  { id: 11, number: '0011', title: 'Доктор Живаго', author: 'Б.Л. Пастернак', status: 'shelf', available: true },
  { id: 12, number: '0012', title: 'Тихий Дон', author: 'М.А. Шолохов', status: 'issued', dueDate: '28.11.2026', dueLabel: 'У читателя до 28.11.2026', available: false },
  { id: 13, number: '0013', title: 'Обломов', author: 'И.А. Гончаров', status: 'shelf', available: true },
  { id: 14, number: '0014', title: 'Вишнёвый сад', author: 'А.П. Чехов', status: 'shelf', available: true },
  { id: 15, number: '0015', title: 'Двенадцать стульев', author: 'И.А. Ильф, Е.П. Петров', status: 'checking', dueLabel: 'Недоступна: проверка возврата', available: false },
];

const mockEmployees: Employee[] = [
  { id: 1, name: 'Иванов Иван Иванович' },
  { id: 2, name: 'Петрова Мария Сергеевна' },
  { id: 3, name: 'Сидоров Алексей Петрович' },
  { id: 4, name: 'Козлова Елена Дмитриевна' },
  { id: 5, name: 'Новиков Дмитрий Александрович' },
  { id: 6, name: 'Морозова Ольга Викторовна' },
  { id: 7, name: 'Волков Андрей Николаевич' },
  { id: 8, name: 'Соколова Наталья Игоревна' },
  { id: 9, name: 'Лебедев Сергей Владимирович' },
  { id: 10, name: 'Кузнецова Анна Михайловна' },
];

// Rate limiting simulation
const recentRequests: Map<string, number> = new Map();

function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchBooks(): Promise<Book[]> {
  await simulateDelay(200);
  return [...mockBooks];
}

export async function fetchEmployees(): Promise<Employee[]> {
  await simulateDelay(150);
  return [...mockEmployees];
}

export async function submitRequest(payload: RequestPayload): Promise<RequestResponse> {
  await simulateDelay(500);

  // Rate limiting simulation (60 seconds)
  const requestKey = `${payload.bookId}_${payload.action}_${payload.isEmployee ? payload.employeeId : payload.email}`;
  const now = Date.now();
  const lastRequest = recentRequests.get(requestKey);
  if (lastRequest && (now - lastRequest) < 60000) {
    return {
      ok: false,
      error: 'Повторная отправка той же заявки возможна через 60 секунд. Подождите и попробуйте снова.'
    };
  }

  // Validate book exists
  const book = mockBooks.find(b => b.id === payload.bookId);
  if (!book) {
    return { ok: false, error: 'Книга с указанным номером не найдена.' };
  }

  // Validate status for take action
  if (payload.action === 'take' && !book.available) {
    return { ok: false, error: 'Книга уже занята или недоступна.' };
  }

  // Validate status for return action
  if (payload.action === 'return' && book.status !== 'issued') {
    return { ok: false, error: 'Книга не находится у читателя.' };
  }

  // Validate employee
  if (payload.isEmployee && !payload.employeeId) {
    return { ok: false, error: 'Необходимо выбрать сотрудника.' };
  }

  if (!payload.isEmployee) {
    if (!payload.fullName || payload.fullName.length < 3) {
      return { ok: false, error: 'ФИО должно содержать не менее 3 символов.' };
    }
    if (!payload.position || payload.position.length < 2) {
      return { ok: false, error: 'Должность должна содержать не менее 2 символов.' };
    }
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return { ok: false, error: 'Укажите корректный адрес электронной почты.' };
    }
  }

  // Record request for rate limiting
  recentRequests.set(requestKey, now);

  const requestId = Math.floor(Math.random() * 1000) + 100;
  const message = payload.action === 'take'
    ? 'Необходимо согласование при фактическом взятии книги, обратитесь к Тумановой А.Н.'
    : 'Необходимо согласование при фактической сдаче книги, обратитесь к Тумановой А.Н.';

  return { ok: true, requestId, message };
}
