import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import {
  createSession,
  deleteSession,
  findSession,
  SESSION_COOKIE,
} from '../services/session.service.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const recoverySchema = z.object({ email: z.string().email() });

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid credentials format' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await argon2.verify(user.password, parsed.data.password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = await createSession(user);
  res.cookie(SESSION_COOKIE, token, cookieOptions);
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/forgot-password', async (req, res) => {
  const parsed = recoverySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Enter a valid email address' });
    return;
  }

  // Keep the response identical for existing and unknown accounts.
  res.json({ message: 'If that account exists, recovery instructions have been sent.' });
});

router.get('/google', (_req, res) => {
  res.status(503).json({ message: 'Google sign-in is not configured. Add Google OAuth credentials to the backend environment first.' });
});

router.post('/logout', async (req, res) => {
  const token = req.cookies[SESSION_COOKIE];
  if (token) await deleteSession(token);
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.status(204).send();
});

router.get('/me', requireAdmin, async (req, res) => {
  const session = await findSession(req.cookies[SESSION_COOKIE]);
  res.json({ user: session?.user });
});

export { router as authRouter };
