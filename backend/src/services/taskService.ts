import { Task, Priority, ITask, TaskStatus } from '../models/Task';

export interface AnalyticsResult {
  total: number;
  completed: number;
  pending: number;
  byPriority: { Low: number; Medium: number; High: number };
  byStatus: { 'in-progress': number; done: number };
  thisWeek: number;
  sortedByPriority: ITask[];
}

export interface TaskFilters {
  priority?: string;
  status?: string;
  completed?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedTasks {
  tasks: ITask[];
  total: number;
  page: number;
  totalPages: number;
}

const PRIORITY_ORDER: Record<Priority, number> = { High: 1, Medium: 2, Low: 3 };

/** Create a new task for a specific user */
export async function createTask(
  title: string,
  priority: Priority,
  userId: string,
  dueDate?: string
): Promise<ITask> {
  const task = new Task({
    title,
    priority,
    userId,
    ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
  });
  return task.save();
}

/** Get all tasks for a user with optional filters and pagination */
export async function getAllTasks(
  userId: string,
  filters: TaskFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedTasks> {
  const query: Record<string, unknown> = { userId };

  if (filters.priority && ['Low', 'Medium', 'High'].includes(filters.priority)) {
    query.priority = filters.priority;
  }
  if (filters.status && ['in-progress', 'done'].includes(filters.status)) {
    query.status = filters.status;
  }
  if (filters.completed !== undefined) {
    query.completed = filters.completed;
  }

  const page = Math.max(1, pagination.page ?? 1);
  const limit = Math.min(100, Math.max(1, pagination.limit ?? 20));
  const skip = (page - 1) * limit;
  const sortField = pagination.sortBy ?? 'createdAt';
  const sortOrder = pagination.order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(query),
  ]);

  return { tasks, total, page, totalPages: Math.ceil(total / limit) };
}

/** Toggle the completed status of a task (must belong to user) */
export async function toggleComplete(id: string, userId: string): Promise<ITask | null> {
  const task = await Task.findOne({ _id: id, userId });
  if (!task) return null;
  task.completed = !task.completed;
  task.status = task.completed ? 'done' : 'in-progress';
  return task.save();
}

/** Update a task (must belong to user) */
export async function updateTask(
  id: string,
  userId: string,
  updates: Partial<Pick<ITask, 'title' | 'priority' | 'status' | 'dueDate' | 'completed'>>
): Promise<ITask | null> {
  // Sync completed <-> status
  if (updates.status === 'done') updates.completed = true;
  if (updates.status === 'in-progress') updates.completed = false;
  if (updates.completed === true && !updates.status) updates.status = 'done' as TaskStatus;
  if (updates.completed === false && !updates.status) updates.status = 'in-progress' as TaskStatus;

  return Task.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  );
}

/** Delete a task (must belong to user) */
export async function deleteTask(id: string, userId: string): Promise<ITask | null> {
  return Task.findOneAndDelete({ _id: id, userId });
}

/** Compute analytics summary for a specific user */
export async function getAnalytics(userId: string): Promise<AnalyticsResult> {
  const allTasks = await Task.find({ userId });

  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const byPriority: { Low: number; Medium: number; High: number } = {
    Low: 0,
    Medium: 0,
    High: 0,
  };
  const byStatus: { 'in-progress': number; done: number } = {
    'in-progress': 0,
    done: 0,
  };

  for (const t of allTasks) {
    byPriority[t.priority]++;
    byStatus[t.status]++;
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - diffToMonday);

  const thisWeek = allTasks.filter((t) => new Date(t.createdAt) >= startOfWeek).length;

  const sortedByPriority = [...allTasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  return { total, completed, pending, byPriority, byStatus, thisWeek, sortedByPriority };
}
