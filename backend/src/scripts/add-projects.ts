import 'dotenv/config';
import { prisma } from '../services/prisma.js';

const projects = [
  ['Spotify Song Recommendation System', 'Data Science / Machine Learning', 'A Python and Streamlit recommendation system that uses song audio features, feature weighting, KNN, and PCA to find and visualize similar songs. Users can search for a song and receive personalized recommendations based on musical similarity.', 'Python, Streamlit, KNN, PCA, Machine Learning'],
  ['AI Wardrobe Planner & Closet Analyzer', 'Artificial Intelligence / Full-Stack Development', "An AI-powered application designed to analyze a user's clothing collection and generate contextual outfit recommendations, with planned weather-aware recommendations and intelligent wardrobe organization.", 'AI, Full-Stack Development, Recommendations'],
  ['Point-of-Sale & Marketplace Web Application', 'Web Development / Full-Stack Development', 'A web-based marketplace and point-of-sale application developed as a university project for a stationery business. Built collaboratively with React and Express, integrating frontend, backend, APIs, and database functionality.', 'React, Express, APIs, Database'],
  ['E-Commerce Olist Data Analysis', 'Data Science / Data Analysis', 'A data analysis project using the Brazilian Olist e-commerce dataset to explore customer, order, product, seller, and sales data and extract meaningful insights through data processing and analysis.', 'Python, Data Analysis, E-Commerce, Data Processing'],
  ['Build with AI Hackathon UNISABANA 2026', 'Hackathon / Artificial Intelligence', "Participated in the Google Build with AI Hackathon at Universidad de La Sabana, developing an AI-assisted financial solution as part of a student team and serving as second team leader.", 'Google Build with AI, Artificial Intelligence, Hackathon'],
  ['Reto del Rector 2026', 'Hackathon / Artificial Intelligence', "Participated in Universidad de La Sabana's Reto del Rector, developing a proposal around the use of artificial intelligence to enhance human intelligence and address challenges faced by students in the age of AI.", 'Artificial Intelligence, Hackathon, UNISABANA'],
  ['Personal Portfolio Website', 'Web Development', 'A personal portfolio website designed to showcase academic experience, technical skills, projects, certifications, and achievements, with a custom system for managing and displaying professional information.', 'React, TypeScript, Express, Prisma, SQLite'],
  ['Certificate Management & Automation System', 'Web Development / Automation', 'A personal web application designed to organize and manage professional certificates, automatically extracting and structuring information such as course name, completion date, duration, issuing organization, serial number, and course ID.', 'React, Express, Prisma, PDF Automation'],
] as const;

for (const [title, type, description, stack] of projects) {
  const existing = await prisma.project.findFirst({ where: { title } });
  if (existing) await prisma.project.update({ where: { id: existing.id }, data: { type, description, stack, published: true } });
  else await prisma.project.create({ data: { title, type, description, stack, published: true } });
}

console.log(`Added or updated ${projects.length} projects.`);
await prisma.$disconnect();
