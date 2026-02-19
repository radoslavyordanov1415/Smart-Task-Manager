import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthPayload {
  user: {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    createdAt: Date;
  };
  token: string;
}

export interface ProfileUpdateData {
  username?: string;
  avatar?: string;
}

function signToken(user: IUser): string {
  const secret = process.env.JWT_SECRET ?? 'fallback_secret';
  const expiresIn = (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d';
  return jwt.sign(
    { userId: String(user._id), username: user.username, email: user.email },
    secret,
    { expiresIn }
  );
}

function serializeUser(user: IUser): AuthPayload['user'] {
  return {
    _id: String(user._id),
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? '',
    createdAt: user.createdAt,
  };
}

/** Register a new user */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthPayload> {
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    const field = exists.email === email.toLowerCase() ? 'Email' : 'Username';
    throw Object.assign(new Error(`${field} is already in use`), { statusCode: 409 });
  }

  const user = await new User({ username, email, password }).save();
  const token = signToken(user);
  return { user: serializeUser(user), token };
}

/** Login with email + password */
export async function login(email: string, password: string): Promise<AuthPayload> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const token = signToken(user);
  return { user: serializeUser(user), token };
}

/** Get profile by userId */
export async function getProfile(userId: string): Promise<AuthPayload['user']> {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }
  return serializeUser(user);
}

/** Update username and/or avatar */
export async function updateProfile(
  userId: string,
  data: ProfileUpdateData
): Promise<AuthPayload['user']> {
  if (data.username) {
    const taken = await User.findOne({ username: data.username, _id: { $ne: userId } });
    if (taken) {
      throw Object.assign(new Error('Username is already in use'), { statusCode: 409 });
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { ...(data.username && { username: data.username }), ...(data.avatar !== undefined && { avatar: data.avatar }) } },
    { returnDocument: 'after', runValidators: true }
  );

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  return serializeUser(user);
}
