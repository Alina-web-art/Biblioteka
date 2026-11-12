export interface Book {
  id: number;
  number: string;
  title: string;
  author: string;
  status: 'shelf' | 'issued' | 'checking' | 'repair' | 'written_off';
  dueDate?: string;
  dueLabel?: string;
  available: boolean;
}

export interface Employee {
  id: number;
  name: string;
}

export interface RequestPayload {
  bookId: number;
  action: 'take' | 'return';
  isEmployee: boolean;
  employeeId?: number;
  fullName?: string;
  position?: string;
  email?: string;
}

export interface RequestResponse {
  ok: boolean;
  requestId?: number;
  message?: string;
  error?: string;
}

export interface HealthStatus {
  ok: boolean;
  portal: boolean;
  cacheAgeSec: number;
}
