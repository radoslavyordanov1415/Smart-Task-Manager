import { Router } from 'express';
import {
  createTask,
  getTasks,
  toggleComplete,
  updateTask,
  deleteTask,
  getAnalytics,
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(protect);

// Analytics must be declared before /:id routes to avoid being caught as an id
router.get('/analytics', getAnalytics);

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id/complete', toggleComplete);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
