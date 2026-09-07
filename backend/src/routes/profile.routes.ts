import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { prisma } from '../services/prisma.js';

const router = Router();
const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  headline: z.string().trim().min(1).max(180),
  bio: z.string().trim().max(5000),
  location: z.string().trim().max(120).nullable().optional(),
  email: z.string().email().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

const defaultProfile = {
  fullName: 'Sofía Arbeláez Mejía',
  headline: 'Data Science Student | Computer Engineering',
  bio: '',
  location: null,
  email: 'sofia.arbelaez.mejia@gmail.com',
  linkedinUrl: null,
  githubUrl: null,
  avatarUrl: null,
};

router.get('/', requireAdmin, async (_req, res) => {
  const profile = await prisma.profile.findFirst();
  res.json({ profile: profile ?? defaultProfile });
});

router.get('/public', async (_req, res) => {
  const profile = await prisma.profile.findFirst({
    select: { fullName: true, headline: true, bio: true, location: true, email: true, linkedinUrl: true, githubUrl: true, avatarUrl: true },
  });
  res.json({ profile: profile ?? defaultProfile });
});

router.patch('/', requireAdmin, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid profile data', issues: parsed.error.flatten() });
    return;
  }

  const current = await prisma.profile.findFirst();
  const profile = current
    ? await prisma.profile.update({ where: { id: current.id }, data: parsed.data })
    : await prisma.profile.create({ data: parsed.data });
  res.json({ profile });
});

export { router as profileRouter };
