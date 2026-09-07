import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { prisma } from '../services/prisma.js';

const router = Router();
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const availabilityFields = z.object({
  title: z.string().trim().min(1).max(120),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timePattern),
  endTime: z.string().regex(timePattern),
  timezone: z.string().trim().min(1).max(80),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  notes: z.string().trim().max(500).nullable().optional(),
});
const availabilitySchema = availabilityFields.superRefine((value, context) => {
  if (value.startTime >= value.endTime) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endTime'],
      message: 'End time must be later than start time',
    });
  }
});

router.get('/', async (_req, res) => {
  const windows = await prisma.availabilityWindow.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
  res.json({ windows });
});

router.get('/admin', requireAdmin, async (_req, res) => {
  const windows = await prisma.availabilityWindow.findMany({
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
  res.json({ windows });
});

router.post('/', requireAdmin, async (req, res) => {
  const parsed = availabilitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid availability window', issues: parsed.error.flatten() });
    return;
  }

  const window = await prisma.availabilityWindow.create({ data: parsed.data });
  res.status(201).json({ window });
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = availabilityFields.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid availability window', issues: parsed.error.flatten() });
    return;
  }

  const current = await prisma.availabilityWindow.findUnique({ where: { id: req.params.id } });
  if (!current) {
    res.status(404).json({ message: 'Availability window not found' });
    return;
  }

  const nextStart = parsed.data.startTime ?? current.startTime;
  const nextEnd = parsed.data.endTime ?? current.endTime;
  if (nextStart >= nextEnd) {
    res.status(400).json({ message: 'End time must be later than start time' });
    return;
  }

  const window = await prisma.availabilityWindow.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json({ window });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const result = await prisma.availabilityWindow.deleteMany({ where: { id: req.params.id } });
  if (result.count === 0) {
    res.status(404).json({ message: 'Availability window not found' });
    return;
  }
  res.status(204).send();
});

export { router as availabilityRouter };
