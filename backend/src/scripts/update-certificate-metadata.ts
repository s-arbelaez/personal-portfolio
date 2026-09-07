import 'dotenv/config';
import { prisma } from '../services/prisma.js';

const metadata = [
  ['Generative AI for Everyone', '2026-08-16', 60, 'AI & Technology'],
  ['Generative AI in Data Analytics', '2026-08-16', 180, 'AI & Technology'],
  ['AI, Empathy, and Ethics', '2026-08-16', 360, 'AI & Technology'],
  ['Introduction to Data Science', '2025-10-25', 360, 'Data & Analytics'],
  ['Excel Basic to Intermediate', '2026-04-08', 480, 'Data & Analytics'],
  ['Project Management and Agile Methodology Fundamentals', '2025-10-25', 480, 'Professional & Productivity'],
  ['Power BI Fundamentals', '2026-06-01', 480, 'Data & Analytics'],
  ['Critical Thinking and Problem Solving', '2025-12-16', 480, 'Professional & Productivity'],
  ['Copilot', '2026-06-01', 480, 'AI & Technology'],
  ['Artificial Intelligence & Productivity', '2025-10-06', 120, 'AI & Technology'],
  ['Fundamentals of ChatGPT', '2025-10-07', 480, 'AI & Technology'],
  ['Responsible Prompting: Maximize the Impact on Your Business', '2025-12-16', 480, 'AI & Technology'],
  ['Time Management', '2025-10-25', 480, 'Professional & Productivity'],
  ['Personal Branding 360', '2025-10-25', 480, 'Professional & Productivity'],
  ['Intelligent Development with Python and AI', '2025-12-16', 480, 'AI & Technology'],
  ['Practical AI for Marketing', '2026-06-01', 120, 'AI & Technology'],
  ['Innovation and Creativity: Develop Your Creative Thinking Step by Step', '2026-06-01', 480, 'Professional & Productivity'],
  ['Public Speaking Using Acting Techniques', '2026-06-01', 480, 'Professional & Productivity'],
] as const;

const groups: Record<string, string> = {
  'Data Science': 'Data & Analytics',
  'Data Science / Ethics': 'Data & Analytics',
  'Data Analytics / Business Intelligence': 'Data & Analytics',
  'Data & Productivity': 'Data & Analytics',
  'Professional Skills': 'Professional & Productivity',
  'Innovation & Creativity': 'Professional & Productivity',
  'Personal Development / Branding': 'Professional & Productivity',
  'Project Management': 'Professional & Productivity',
  'Productivity / Professional Skills': 'Professional & Productivity',
  'Communication / Public Speaking': 'Professional & Productivity',
};

for (const [title, date, durationMinutes, categoryGroup] of metadata) {
  await prisma.certificate.updateMany({ where: { title }, data: { issuedAt: new Date(`${date}T12:00:00.000Z`), durationMinutes, categoryGroup } });
}

for (const [category, categoryGroup] of Object.entries(groups)) {
  await prisma.certificate.updateMany({ where: { category }, data: { categoryGroup } });
}

await prisma.certificate.updateMany({ where: { categoryGroup: 'Artificial Intelligence' }, data: { categoryGroup: 'AI & Technology' } });
console.log(`Updated metadata for ${metadata.length} dated certificates.`);
await prisma.$disconnect();
