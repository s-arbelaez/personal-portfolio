import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';

const router = Router();
const messageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  subject: z.string().trim().max(180).nullable().optional(),
  company: z.string().trim().max(160).nullable().optional(),
  opportunityType: z.string().trim().max(120).nullable().optional(),
  message: z.string().trim().min(1).max(5000),
});

router.post('/', async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Please complete the required fields.', issues: parsed.error.flatten() });
    return;
  }

  const { opportunityType: _opportunityType, ...data } = parsed.data;
  const contactMessage = await prisma.contactMessage.create({ data });
  res.status(201).json({ message: 'Your message has been sent.', id: contactMessage.id });
});

export { router as contactRouter };
