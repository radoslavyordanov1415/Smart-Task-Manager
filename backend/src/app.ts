import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler — respects statusCode attached to thrown errors
app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') console.error(err.stack);
  const status = err.statusCode ?? 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

export default app;
