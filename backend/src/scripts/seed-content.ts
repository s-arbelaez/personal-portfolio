import 'dotenv/config';
import { prisma } from '../services/prisma.js';

const projects = [
  ['Airbnb Barcelona Dataset', 'Academic', 'Exploratory data analysis, cleaning, visualization and statistical reasoning applied to Airbnb data in Barcelona.', 'EDA, Python, pandas, NumPy, Matplotlib, Data Analysis'],
  ['Machine Learning Practice', 'Academic', 'Academic work with supervised and unsupervised learning, model evaluation and feature engineering.', 'scikit-learn, Model Evaluation, Precision, Recall, F1 Score, AUC'],
  ['POS / Web Application', 'Academic / Personal', 'Web application project using React, Vite, Node.js and Express, focused on routing and API integration.', 'React, Vite, JavaScript, Node.js, Express, REST APIs'],
  ['BancAndes case study', 'Academic', 'Academic project on data engineering, real-time data ingestion, ETL/ELT, governance and risk management.', 'Data Engineering, ETL, ELT, Data Governance, Risk Management'],
  ['Smart AI Wardrobe Planner & Closet Analyzer', 'Conceptual / Personal', 'Concept project exploring AI product design, recommendation systems and system architecture.', 'Next.js, Python, FastAPI, PyTorch, Redis, Vector embeddings'],
  ['Certificate Automation', 'Experimental', 'In-progress automation project for certificate parsing, metadata extraction and validation.', 'JavaScript, PDF.js, Regex, Browser APIs'],
] as const;
const certificates = [
  ['Academic / relevant coursework', 'Universidad de La Sabana', 'Academic', 'Data Science, Machine Learning, Data Analytics, Databases and Software Engineering'],
  ['Professional evidence', 'Various academic activities', 'Professional', 'Academic Scholarship, private mathematics tutoring and study group leadership'],
  ['Project-based proof', 'Academic and personal projects', 'Projects', 'Airbnb dataset analysis, machine learning evaluation and web application development'],
] as const;

if ((await prisma.project.count()) === 0) for (const [title, type, description, stack] of projects) await prisma.project.create({ data: { title, type, description, stack } });
if ((await prisma.certificate.count()) === 0) for (const [title, issuer, category, description] of certificates) await prisma.certificate.create({ data: { title, issuer, category, description } });
console.log('Editable portfolio content is ready.');
await prisma.$disconnect();
