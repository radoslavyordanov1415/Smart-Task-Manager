import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

export function protect(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided. Authorization denied.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET ?? 'fallback_secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      _id: decoded.userId as unknown as import('mongoose').Types.ObjectId,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch {
    res.status(401).json({ message: 'Token is invalid or expired.' });
  }
}
