import 'dotenv/config';
import argon2 from 'argon2';
import { prisma } from '../services/prisma.js';

const email = (process.env.ADMIN_EMAIL ?? 'sofia.arbelaez.mejia@gmail.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 12) {
  throw new Error('Set ADMIN_PASSWORD to a password of at least 12 characters before running this script.');
}

const user = await prisma.user.upsert({
  where: { email },
  update: { password: await argon2.hash(password), role: 'ADMIN' },
  create: { email, password: await argon2.hash(password), role: 'ADMIN' },
});

console.log(`Admin account ready: ${user.email}`);
await prisma.$disconnect();
