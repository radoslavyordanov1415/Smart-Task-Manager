import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import { Priority } from '../models/Task';

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, priority, dueDate } = req.body as {
      title: string;
      priority: Priority;
      dueDate?: string;
    };
    if (!title || !priority) {
      res.status(400).json({ message: 'title and priority are required' });
      return;
    }
    const userId = String(req.user!._id);
    const task = await taskService.createTask(title, priority, userId, dueDate);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function getTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { priority, status, completed, page, limit, sortBy, order } = req.query as Record<string, string>;
    const userId = String(req.user!._id);

    const result = await taskService.getAllTasks(
      userId,
      {
        priority,
        status,
        ...(completed !== undefined ? { completed: completed === 'true' } : {}),
      },
      {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        sortBy,
        order: order === 'asc' ? 'asc' : 'desc',
      }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function toggleComplete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = String(req.user!._id);
    const task = await taskService.toggleComplete(req.params['id'] as string, userId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = String(req.user!._id);
    const { title, priority, status, dueDate, completed } = req.body as {
      title?: string;
      priority?: Priority;
      status?: 'in-progress' | 'done';
      dueDate?: string;
      completed?: boolean;
    };

    const task = await taskService.updateTask(req.params['id'] as string, userId, {
      ...(title !== undefined && { title }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
      ...(completed !== undefined && { completed }),
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = String(req.user!._id);
    const task = await taskService.deleteTask(req.params['id'] as string, userId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted', task });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = String(req.user!._id);
    const analytics = await taskService.getAnalytics(userId);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}
