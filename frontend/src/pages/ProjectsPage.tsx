import { useEffect, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
type Project = { id: string; title: string; type: string; description: string; stack: string; };
/*
const projects = [
  {
    title: 'Airbnb Barcelona Dataset',
    type: 'Academic',
    description:
      'Exploratory data analysis, cleaning, visualization and statistical reasoning applied to Airbnb data in Barcelona.',
    stack: ['EDA', 'Python', 'pandas', 'NumPy', 'Matplotlib', 'Data Analysis'],
  },
  {
    title: 'Machine Learning Practice',
    type: 'Academic',
    description:
      'Academic work with supervised and unsupervised learning, model evaluation and feature engineering using classification and regression concepts.',
    stack: ['scikit-learn', 'Model Evaluation', 'Precision', 'Recall', 'F1 Score', 'AUC'],
  },
  {
    title: 'POS / Web Application',
    type: 'Academic / Personal',
    description:
      'Web application project using React, Vite, Node.js and Express, focused on routing, API integration and responsive UI.',
    stack: ['React', 'Vite', 'JavaScript', 'Node.js', 'Express', 'REST APIs'],
  },
  {
    title: 'BancAndes case study',
    type: 'Academic',
    description:
      'Academic project on data engineering, real-time data ingestion, ETL/ELT, data governance, compliance and risk management.',
    stack: ['Data Engineering', 'ETL', 'ELT', 'Data Governance', 'Risk Management'],
  },
  {
    title: 'Smart AI Wardrobe Planner & Closet Analyzer',
    type: 'Conceptual / Personal',
    description:
      'Concept project exploring AI product design, recommendation systems, background workers and system architecture.',
    stack: ['Next.js', 'Python', 'FastAPI', 'PyTorch', 'Redis', 'Vector embeddings'],
  },
  {
    title: 'Certificate Automation',
    type: 'Experimental',
    description:
      'In-progress automation project for Santander Open Academy certificates with PDF parsing, metadata extraction and validation workflow.',
    stack: ['JavaScript', 'PDF.js', 'Regex', 'Browser APIs', 'File System Access API'],
  },
]; */

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { fetch(`${apiBaseUrl}/content/projects`).then((response) => response.json()).then((data: { items: Project[] }) => setProjects(data.items)).catch(() => setProjects([])); }, []);
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Projects</span>
          <h2>Selected project work</h2>
        </div>

        <div className="card-grid">
          {projects.map((project) => (
            <article key={project.title} className="card">
              <span className="section-eyebrow">{project.type}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tag-list">
                {project.stack.split(',').map((item) => (
                  <span key={item} className="tag">{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
