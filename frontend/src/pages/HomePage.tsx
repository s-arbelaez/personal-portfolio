import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../api';

const skillGroups = [
  {
    number: '01',
    title: 'Data science',
    items: ['Exploratory analysis', 'Data cleaning', 'Statistical reasoning', 'Visualization'],
  },
  {
    number: '02',
    title: 'Machine learning',
    items: ['Supervised learning', 'Unsupervised learning', 'Feature engineering', 'Model evaluation'],
  },
  {
    number: '03',
    title: 'Software engineering',
    items: ['Python', 'TypeScript', 'React', 'Node.js', 'REST APIs'],
  },
  {
    number: '04',
    title: 'Data foundations',
    items: ['SQL', 'Databases', 'ETL concepts', 'Data integration'],
  },
];

export function HomePage() {
  const [profileLinks, setProfileLinks] = useState<{ linkedinUrl: string | null; githubUrl: string | null }>({ linkedinUrl: null, githubUrl: null });

  useEffect(() => {
    fetch(`${apiBaseUrl}/profile/public`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Profile request failed with status ${response.status}`);
        return response.json() as Promise<{ profile?: Partial<typeof profileLinks> }>;
      })
      .then((data) => setProfileLinks({
        linkedinUrl: data.profile?.linkedinUrl ?? null,
        githubUrl: data.profile?.githubUrl ?? null,
      }))
      .catch((error: unknown) => {
        console.error('Unable to load public profile links', error);
      });
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-index">
            <span>Portfolio / Colombia</span>
            <span>Data, systems &amp; thoughtful work</span>
          </div>
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="section-eyebrow">Sofía Arbeláez Mejía · Data science &amp; computer engineering</span>
              <h1>Curious by nature.<br /><em>Analytical by design.</em></h1>
              <p>
                I’m a Data Science student and Computer Engineering student at Universidad de La Sabana.
                I bring mathematics, data, and software together to make complex questions easier to work with.
              </p>
              <div className="hero-actions">
                <Link className="btn primary" to="/projects">Explore my work <span aria-hidden="true">↗</span></Link>
                <Link className="btn secondary" to="/contact">Get in touch</Link>
              </div>
              {(profileLinks.linkedinUrl || profileLinks.githubUrl) && <div className="social-links" aria-label="Professional profiles">
                {profileLinks.linkedinUrl && <a className="social-link" href={profileLinks.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>}
                {profileLinks.githubUrl && <a className="social-link" href={profileLinks.githubUrl} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>}
              </div>}
            </div>

            <aside className="hero-visual" aria-label="A visual note on turning data into insight">
              <div className="hero-art">
                <span className="art-index">FIELD NOTE&nbsp; / &nbsp;01</span>
                <svg className="signal-graphic" viewBox="0 0 420 340" role="img" aria-labelledby="signal-title signal-description">
                  <title id="signal-title">From noise to signal</title>
                  <desc id="signal-description">An abstract plotted line moves from scattered points into a clear upward trend.</desc>
                  <path className="graph-grid" d="M32 64H388M32 132H388M32 200H388M32 268H388M88 28V304M168 28V304M248 28V304M328 28V304" />
                  <path className="graph-noise" d="M40 232L76 106L109 250L143 168L178 216L211 105L244 191" />
                  <path className="graph-signal" d="M218 210C253 204 275 173 296 160S340 124 378 78" />
                  <circle className="graph-point" cx="76" cy="106" r="5" />
                  <circle className="graph-point" cx="143" cy="168" r="5" />
                  <circle className="graph-point" cx="211" cy="105" r="5" />
                  <circle className="graph-point graph-point-featured" cx="378" cy="78" r="7" />
                </svg>
                <div className="art-label"><span>OBSERVE</span><span>CONNECT</span><span>BUILD</span></div>
                <span className="art-caption">Find the pattern.<br />Make it useful.</span>
              </div>
              <div className="visual-footnote"><span>01 — 04</span><span>Data × engineering</span></div>
            </aside>
          </div>
          <a className="scroll-cue" href="#about"><span aria-hidden="true">↓</span> A little more about me</a>
        </div>
      </section>

      <div className="discipline-rail">
        <ul className="container discipline-list" aria-label="Areas of study">
          <li>Statistics</li><li>Data science</li><li>Machine learning</li><li>Software</li>
        </ul>
      </div>

      <section className="section about-section" id="about">
        <div className="container editorial-grid">
          <div className="section-marker"><span>01</span><span>Perspective</span></div>
          <div className="about-copy">
            <span className="section-eyebrow">A useful point of view</span>
            <h2>Good work starts with <em>good questions.</em></h2>
            <p>
              My studies bring together mathematics, statistics, data analysis, machine learning, databases,
              and software engineering. I’m interested in the space where those disciplines meet—and in building
              practical, thoughtful ways to solve real problems.
            </p>
            <p>
              I value clear reasoning, careful craft, and making technical ideas easier for people to use.
            </p>
            <Link className="text-link" to="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
          </div>
          <aside className="margin-note">
            <span className="margin-note-mark" aria-hidden="true">✳</span>
            <span className="margin-note-label">Working across disciplines</span>
            <strong>From a question<br />to a working idea.</strong>
            <span className="margin-note-rule" />
            <span className="margin-note-detail">Mathematics / Data / Software</span>
          </aside>
        </div>
      </section>

      <section className="section skills-section" aria-labelledby="capabilities-title">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">02 / Technical range</span>
              <h2 id="capabilities-title">Tools for asking<br /><em>better questions.</em></h2>
            </div>
            <p>Foundations in data and engineering, with room to keep learning.</p>
          </div>
          <div className="capability-grid">
            {skillGroups.map((group) => (
              <article key={group.number} className="capability-card">
                <span className="capability-number">{group.number}</span>
                <h3>{group.title}</h3>
                <div className="tag-list">
                  {group.items.map((item) => <span key={item} className="tag">{item}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section credentials-section" aria-labelledby="path-title">
        <div className="container editorial-grid">
          <div className="section-marker"><span>03</span><span>In practice</span></div>
          <div className="credentials-content">
            <div className="section-header">
              <span className="section-eyebrow">Learning, building, sharing</span>
              <h2 id="path-title">A foundation with <em>momentum.</em></h2>
            </div>
            <div className="credential-list">
              <article className="credential-row">
                <span className="credential-index">A</span>
                <div><h3>Two connected disciplines</h3><p>Data Science and Computer Engineering at Universidad de La Sabana.</p></div>
                <span className="credential-aside">Education</span>
              </article>
              <article className="credential-row">
                <span className="credential-index">B</span>
                <div><h3>Academic scholarship</h3><p>Recognized with an academic scholarship at Universidad de La Sabana.</p></div>
                <span className="credential-aside">Recognition</span>
              </article>
              <article className="credential-row">
                <span className="credential-index">C</span>
                <div><h3>Making learning clearer</h3><p>Approximately two years of private mathematics tutoring.</p></div>
                <span className="credential-aside">Communication</span>
              </article>
            </div>
            <div className="closing-cta">
              <p>Have a thoughtful problem to solve?</p>
              <Link className="btn primary" to="/contact">Let’s talk <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
