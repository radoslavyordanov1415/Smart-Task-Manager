import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, email, password } = req.body as {
      username: string;
      email: string;
      password: string;
    };

    if (!username || !email || !password) {
      res.status(400).json({ message: 'username, email and password are required' });
      return;
    }

    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  // JWT is stateless — instruct the client to discard the token
  res.json({ message: 'Logged out successfully. Please delete your token on the client.' });
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile = await authService.getProfile(String(req.user!._id));
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, avatar } = req.body as { username?: string; avatar?: string };
    const profile = await authService.updateProfile(String(req.user!._id), {
      username,
      avatar,
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}
