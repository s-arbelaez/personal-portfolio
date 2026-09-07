import { useEffect, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
const profileHighlights = [
  'Academic Scholarship — Universidad de La Sabana',
  'Data Science + Computer Engineering',
  'Machine Learning, Data Analytics & Software Engineering',
  'Approximately 2 years of private mathematics tutoring',
];

const skillGroups = [
  {
    title: 'Programming',
    items: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'HTML', 'CSS'],
  },
  {
    title: 'Data Science',
    items: ['EDA', 'Data Analytics', 'Data Cleaning', 'Statistical Reasoning', 'Data Visualization'],
  },
  {
    title: 'Machine Learning',
    items: ['Supervised Learning', 'Unsupervised Learning', 'Feature Engineering', 'Model Evaluation', 'AUC'],
  },
  {
    title: 'Software Engineering',
    items: ['React', 'Vite', 'Node.js', 'Express', 'REST APIs', 'Git / GitHub'],
  },
  {
    title: 'Databases & Data Engineering',
    items: ['SQL', 'PostgreSQL concepts', 'MySQL concepts', 'ETL concepts', 'Data Integration'],
  },
  {
    title: 'Tools',
    items: ['Python', 'Jupyter', 'Google Colab', 'Power Pivot', 'DAX', 'Azure'],
  },
];

export function HomePage() {
  const [profileLinks, setProfileLinks] = useState<{ linkedinUrl: string | null; githubUrl: string | null }>({ linkedinUrl: null, githubUrl: null });
  useEffect(() => { fetch(`${apiBaseUrl}/profile/public`).then((response) => response.json()).then((data: { profile: typeof profileLinks }) => setProfileLinks(data.profile)).catch(() => undefined); }, []);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="section-eyebrow">Profile</span>
            <h1>Data Science Student | Computer Engineering | ML · Analytics · Software</h1>
            <p>
              Sofía Arbeláez Mejía is a Data Science student pursuing a double degree in Data Science and
              Computer Engineering at Universidad de La Sabana, with a strong academic foundation in mathematics,
              statistics, machine learning, software engineering and data-driven problem solving.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="/projects">View my work</a>
              <a className="btn secondary" href="/contact">Contact me</a>
            </div>
            {(profileLinks.linkedinUrl || profileLinks.githubUrl) && <div className="social-links" aria-label="Professional profiles">
              {profileLinks.linkedinUrl && <a className="social-link" href={profileLinks.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
              {profileLinks.githubUrl && <a className="social-link" href={profileLinks.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
            </div>}
          </div>

          <aside className="hero-card" aria-label="Profile overview">
            <h3>Professional profile</h3>
            <ul className="list">
              {profileHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">About</span>
            <h2>Data Science + Software Engineering</h2>
          </div>
          <p>
            I am a Data Science student with a double program in Computer Engineering at Universidad de La Sabana,
            where my academic training combines mathematics, statistics, data analysis, machine learning, databases,
            and software engineering. I am especially interested in projects where data and software meet to solve
            real problems through analytical thinking and technical implementation.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Skills</span>
            <h2>Core capabilities</h2>
          </div>
          <div className="card-grid">
            {skillGroups.map((group) => (
              <article key={group.title} className="card">
                <h3>{group.title}</h3>
                <div className="tag-list">
                  {group.items.map((item) => (
                    <span key={item} className="tag">{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Highlights</span>
            <h2>Academic and leadership strengths</h2>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <strong>🎓</strong>
              <span>Data Science + Computer Engineering</span>
            </div>
            <div className="metric">
              <strong>🏆</strong>
              <span>Academic scholarship recipient</span>
            </div>
            <div className="metric">
              <strong>📊</strong>
              <span>Statistics, analytics and machine learning</span>
            </div>
            <div className="metric">
              <strong>💻</strong>
              <span>Web apps, APIs and software projects</span>
            </div>
            <div className="metric">
              <strong>🧮</strong>
              <span>Strong mathematical foundation</span>
            </div>
            <div className="metric">
              <strong>👩‍🏫</strong>
              <span>Private mathematics tutor for approximately 2 years</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
