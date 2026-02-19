export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'in-progress' | 'done';

export interface Task {
  _id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  userId: string;
}

export interface ByPriority {
  Low: number;
  Medium: number;
  High: number;
}

export interface ByStatus {
  'in-progress': number;
  done: number;
}

export interface Analytics {
  total: number;
  completed: number;
  pending: number;
  byPriority: ByPriority;
  byStatus: ByStatus;
  thisWeek: number;
  sortedByPriority: Task[];
}

export interface PaginatedTasks {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
}

// Auth types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
