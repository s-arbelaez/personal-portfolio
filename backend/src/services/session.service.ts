import { createHash, randomBytes } from 'node:crypto';
import type { User } from '@prisma/client';
import { prisma } from './prisma.js';

const SESSION_COOKIE = 'portfolio_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(user: User) {
  const token = randomBytes(32).toString('hex');
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

export async function findSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session;
}

export async function deleteSession(token: string) {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export { SESSION_COOKIE };
