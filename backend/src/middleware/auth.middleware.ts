import type { NextFunction, Request, Response } from 'express';
import { findSession, SESSION_COOKIE } from '../services/session.service.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const session = await findSession(token);
  if (!session || session.user.role !== 'ADMIN') {
    res.status(401).json({ message: 'Invalid or expired session' });
    return;
  }

  res.locals.user = session.user;
  next();
}
