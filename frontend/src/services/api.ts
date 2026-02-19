import axios from 'axios';
import type { Task, Analytics, Priority, TaskStatus, PaginatedTasks, AuthResponse, User } from '../types/Task';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extract human-readable error messages from API responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    if (error.response?.status === 401) {
      return Promise.reject(new Error('Session expired. Please sign in again.'));
    }
    return Promise.reject(error);
  },
);

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', { username, email, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getProfile(): Promise<User> {
  const res = await api.get<{ user: User }>('/auth/profile');
  return res.data.user;
}

export async function updateProfile(data: { username?: string; avatar?: string }): Promise<User> {
  const res = await api.patch<{ user: User }>('/auth/profile', data);
  return res.data.user;
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export interface TaskFilters {
  priority?: Priority | '';
  status?: TaskStatus | '';
  page?: number;
  limit?: number;
}

/** Fetch tasks with optional filters and pagination */
export async function fetchTasks(filters: TaskFilters = {}): Promise<PaginatedTasks> {
  const params: Record<string, string | number> = {};
  if (filters.priority) params['priority'] = filters.priority;
  if (filters.status) params['status'] = filters.status;
  if (filters.page) params['page'] = filters.page;
  if (filters.limit) params['limit'] = filters.limit;
  const res = await api.get<PaginatedTasks>('/tasks', { params });
  return res.data;
}

/** Create a new task */
export async function createTask(
  title: string,
  priority: Priority,
  status?: TaskStatus,
  dueDate?: string,
): Promise<Task> {
  const res = await api.post<Task>('/tasks', { title, priority, status, dueDate });
  return res.data;
}

/** Update a task (title, priority, status, dueDate) */
export async function updateTask(
  id: string,
  data: Partial<{ title: string; priority: Priority; status: TaskStatus; dueDate: string }>,
): Promise<Task> {
  const res = await api.patch<Task>(`/tasks/${id}`, data);
  return res.data;
}

/** Toggle task completion */
export async function toggleTaskComplete(id: string): Promise<Task> {
  const res = await api.patch<Task>(`/tasks/${id}/complete`);
  return res.data;
}

/** Delete a task */
export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

/** Fetch analytics summary */
export async function fetchAnalytics(): Promise<Analytics> {
  const res = await api.get<Analytics>('/tasks/analytics');
  return res.data;
}

