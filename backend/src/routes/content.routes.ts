import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { prisma } from '../services/prisma.js';

const router = Router();
const certificateUploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/certificates');
mkdirSync(certificateUploadDirectory, { recursive: true });
const certificateUpload = multer({
  storage: multer.diskStorage({
    destination: certificateUploadDirectory,
    filename: (_req, file, callback) => callback(null, `${randomUUID()}.pdf`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype === 'application/pdf'),
});
const projectSchema = z.object({
  title: z.string().trim().min(1).max(160), type: z.string().trim().min(1).max(80),
  description: z.string().trim().max(5000), stack: z.string().trim().max(1000),
  featured: z.boolean().default(false), published: z.boolean().default(true),
});
const certificateSchema = z.object({
  title: z.string().trim().min(1).max(160), categoryGroup: z.string().trim().min(1).max(100).default('Professional & Productivity'), category: z.string().trim().min(1).max(120),
  issuer: z.string().trim().max(160).nullable().optional(), description: z.string().trim().max(5000).nullable().optional(), issuedAt: z.coerce.date().nullable().optional(), durationMinutes: z.number().int().positive().max(100000).nullable().optional(), url: z.union([z.string().url(), z.string().regex(/^\/uploads\/[\w./-]+$/)]).nullable().optional(),
});
const experienceSchema = z.object({
  title: z.string().trim().min(1).max(160), company: z.string().trim().max(160).nullable().optional(), location: z.string().trim().max(160).nullable().optional(), description: z.string().trim().max(5000), startDate: z.coerce.date().nullable().optional(), endDate: z.coerce.date().nullable().optional(), current: z.boolean().default(false),
});
const educationSchema = z.object({
  institution: z.string().trim().min(1).max(180), degree: z.string().trim().min(1).max(180), field: z.string().trim().max(180).nullable().optional(), startDate: z.coerce.date().nullable().optional(), endDate: z.coerce.date().nullable().optional(), description: z.string().trim().max(5000).nullable().optional(),
});
const skillSchema = z.object({ name: z.string().trim().min(1).max(120), groupId: z.string().min(1) });
const groupSchema = z.object({ name: z.string().trim().min(1).max(120), order: z.number().int().default(0) });

function registerCrud(path: string, schema: z.AnyZodObject, findMany: (admin: boolean) => Promise<unknown>, create: (data: any) => Promise<unknown>, update: (id: string, data: any) => Promise<unknown>, remove: (id: string) => Promise<boolean>) {
  router.get(`/${path}`, (req, res, next) => req.query.admin === 'true' ? requireAdmin(req, res, next) : next(), async (req, res) => res.json({ items: await findMany(req.query.admin === 'true') }));
  router.post(`/${path}`, requireAdmin, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: `Invalid ${path} data`, issues: parsed.error.flatten() }); return; }
    res.status(201).json({ item: await create(parsed.data) });
  });
  router.patch(`/${path}/:id`, requireAdmin, async (req, res) => {
    const parsed = schema.partial().safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: `Invalid ${path} data`, issues: parsed.error.flatten() }); return; }
    const item = await update(req.params.id, parsed.data);
    if (!item) { res.status(404).json({ message: `${path} item not found` }); return; }
    res.json({ item });
  });
  router.delete(`/${path}/:id`, requireAdmin, async (req, res) => {
    if (!(await remove(req.params.id))) { res.status(404).json({ message: `${path} item not found` }); return; }
    res.status(204).send();
  });
}

router.post('/certificates/upload', requireAdmin, certificateUpload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'A PDF certificate file is required.' });
    return;
  }
  res.status(201).json({ url: `/uploads/certificates/${req.file.filename}` });
});

registerCrud('projects', projectSchema, (admin) => prisma.project.findMany({ where: admin ? undefined : { published: true }, orderBy: { createdAt: 'desc' } }), (data) => prisma.project.create({ data }), (id, data) => prisma.project.update({ where: { id }, data }).catch(() => null), async (id) => (await prisma.project.deleteMany({ where: { id } })).count > 0);
registerCrud('certificates', certificateSchema, () => prisma.certificate.findMany({ orderBy: { createdAt: 'desc' } }), (data) => prisma.certificate.create({ data }), (id, data) => prisma.certificate.update({ where: { id }, data }).catch(() => null), async (id) => (await prisma.certificate.deleteMany({ where: { id } })).count > 0);
registerCrud('experience', experienceSchema, () => prisma.experience.findMany({ orderBy: { createdAt: 'desc' } }), (data) => prisma.experience.create({ data }), (id, data) => prisma.experience.update({ where: { id }, data }).catch(() => null), async (id) => (await prisma.experience.deleteMany({ where: { id } })).count > 0);
registerCrud('education', educationSchema, () => prisma.education.findMany({ orderBy: { createdAt: 'desc' } }), (data) => prisma.education.create({ data }), (id, data) => prisma.education.update({ where: { id }, data }).catch(() => null), async (id) => (await prisma.education.deleteMany({ where: { id } })).count > 0);
registerCrud('skill-groups', groupSchema, () => prisma.skillGroup.findMany({ include: { skills: true }, orderBy: { order: 'asc' } }), (data) => prisma.skillGroup.create({ data }), (id, data) => prisma.skillGroup.update({ where: { id }, data }).catch(() => null), async (id) => (await prisma.skillGroup.deleteMany({ where: { id } })).count > 0);
registerCrud('skills', skillSchema, () => prisma.skill.findMany({ orderBy: { createdAt: 'desc' } }), (data) => prisma.skill.create({ data }), (id, data) => prisma.skill.update({ where: { id }, data }).catch(() => null), async (id) => (await prisma.skill.deleteMany({ where: { id } })).count > 0);

export { router as contentRouter };
