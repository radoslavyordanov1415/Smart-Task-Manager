// Augments Express Request to carry the authenticated user payload
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        username: string;
        email: string;
      };
    }
  }
}

export {};
