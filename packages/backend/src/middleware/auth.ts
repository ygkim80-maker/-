import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'fulfillment-center-secret-key-change-me';

export interface AuthUser {
  id: string;
  role: string;
  shipperId: string | null;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function auth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing token' });
    return;
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = {
      id: decoded.id,
      role: decoded.role,
      shipperId: decoded.shipperId ?? null,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}

export default auth;
