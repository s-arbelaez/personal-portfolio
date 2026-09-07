import 'dotenv/config';
import { prisma } from '../services/prisma.js';

const certificates = [
  {
    title: 'Artificial Intelligence & Productivity',
    category: 'Artificial Intelligence',
    description: 'Training focused on using artificial intelligence tools to improve productivity, automate tasks, and enhance everyday academic and professional workflows.',
    issuer: 'Google + Santander Open Academy',
  },
  {
    title: 'Fundamentals of ChatGPT',
    category: 'Generative AI',
    description: 'Introduction to ChatGPT and its practical applications, including effective interaction with generative AI and using it as a productivity and learning tool.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Responsible Prompting: Maximize the Impact on Your Business',
    category: 'Prompt Engineering / Responsible AI',
    description: 'Training on responsible prompting techniques and how to design effective prompts to obtain better results from AI tools in professional and business contexts.',
    issuer: 'Microsoft + Founders / Santander Open Academy',
  },
  {
    title: 'Copilot',
    category: 'Artificial Intelligence',
    description: 'Training on Microsoft Copilot and its applications for productivity, content creation, and working more effectively with generative AI.',
    issuer: 'Microsoft + Santander Open Academy',
  },
  {
    title: 'Intelligent Development with Python and AI',
    category: 'Python / Artificial Intelligence',
    description: 'Training on combining Python development with AI tools to improve programming workflows and support intelligent software development.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Practical AI for Marketing',
    category: 'Artificial Intelligence / Marketing',
    description: 'Practical applications of generative AI and Google Gemini for marketing, including content creation, productivity, and business-related tasks.',
    issuer: 'Google / Google Gemini + Santander Open Academy',
  },
  {
    title: 'Generative AI for Everyone',
    category: 'Generative AI',
    description: 'Introduction to generative AI concepts, applications, opportunities, and responsible use across different professional and everyday contexts.',
    issuer: 'Coursera',
  },
  {
    title: 'Generative AI in Data Analytics',
    category: 'Artificial Intelligence / Data Analytics',
    description: 'Exploration of how generative AI can support data analytics workflows and enhance the way data professionals work with information and insights.',
    issuer: 'Meta',
  },
  {
    title: 'AI, Empathy, and Ethics',
    category: 'AI Ethics',
    description: 'Exploration of the relationship between artificial intelligence, empathy, human values, and ethical considerations in the development and use of AI.',
    issuer: 'University of California, Santa Cruz',
  },
  {
    title: 'Generative AI Foundations',
    category: 'Generative AI',
    description: 'Foundational learning pathway covering key concepts and practical applications of generative artificial intelligence.',
    issuer: 'Coursera',
  },
  {
    title: 'Introduction to Data Science',
    category: 'Data Science',
    description: 'Introduction to the fundamentals of data science, including the role of data, analytical thinking, and the data science process.',
    issuer: 'IE University',
  },
  {
    title: 'Data Science Ethics',
    category: 'Data Science / Ethics',
    description: 'Exploration of ethical issues in data science, including responsible data use, privacy, fairness, bias, and the social impact of data-driven decisions.',
    issuer: 'University of Michigan',
  },
  {
    title: 'Critical Thinking and Problem Solving',
    category: 'Professional Skills',
    description: 'Development of critical-thinking and problem-solving skills for analyzing situations, evaluating information, and making effective decisions.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Innovation and Creativity: Develop Your Creative Thinking Step by Step',
    category: 'Innovation & Creativity',
    description: 'Training focused on developing creative thinking, generating ideas, and applying innovative approaches to challenges and problem-solving.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Personal Branding 360',
    category: 'Personal Development / Branding',
    description: 'Training on building and strengthening a personal brand, communicating professional value, and developing a consistent professional identity.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Project Management and Agile Methodology Fundamentals',
    category: 'Project Management',
    description: 'Introduction to project management principles and Agile methodologies for planning, organizing, and managing projects effectively.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Time Management',
    category: 'Productivity / Professional Skills',
    description: 'Training focused on organizing priorities, managing time effectively, and developing productive habits for academic and professional activities.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Public Speaking Using Acting Techniques',
    category: 'Communication / Public Speaking',
    description: 'Training using acting techniques to improve public speaking, communication, confidence, and presentation skills.',
    issuer: 'Escuela Universitaria de Artes TAI',
  },
  {
    title: 'Excel Basic to Intermediate',
    category: 'Data & Productivity',
    description: 'Training covering fundamental to intermediate Excel skills for organizing, analyzing, and working with data effectively.',
    issuer: 'Santander Open Academy',
  },
  {
    title: 'Power BI Fundamentals',
    category: 'Data Analytics / Business Intelligence',
    description: 'Introduction to Power BI and its use for transforming data into visualizations, reports, and actionable insights.',
    issuer: 'Santander Open Academy',
  },
] as const;

for (const certificate of certificates) {
  const existing = await prisma.certificate.findFirst({ where: { title: certificate.title } });
  if (existing) {
    await prisma.certificate.update({ where: { id: existing.id }, data: certificate });
  } else {
    await prisma.certificate.create({ data: certificate });
  }
}

console.log(`Added or updated ${certificates.length} certificates.`);
await prisma.$disconnect();
