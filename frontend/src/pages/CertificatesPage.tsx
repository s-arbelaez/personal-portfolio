import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
type Certificate = { id: string; title: string; categoryGroup: string; category: string; issuer: string | null; description: string | null; url: string | null; issuedAt: string | null; durationMinutes: number | null; };
/*
const certificateGroups = [
  {
    title: 'Academic / relevant coursework',
    items: ['Data Science', 'Machine Learning', 'Data Analytics', 'Databases', 'Software Engineering'],
  },
  {
    title: 'Professional evidence',
    items: ['Academic Scholarship', 'Private mathematics tutoring', 'Study group leadership'],
  },
  {
    title: 'Project-based proof',
    items: ['Airbnb dataset analysis', 'Machine learning evaluation', 'Web application development'],
  },
]; */

export function CertificatesPage() {
  const [certificateGroups, setCertificateGroups] = useState<Certificate[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [openCertificate, setOpenCertificate] = useState<Certificate | null>(null);
  useEffect(() => { fetch(`${apiBaseUrl}/content/certificates`).then((response) => response.json()).then((data: { items: Certificate[] }) => setCertificateGroups(data.items)).catch(() => setCertificateGroups([])); }, []);
  useEffect(() => {
    if (!openCertificate) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenCertificate(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [openCertificate]);
  const groups = useMemo(() => ['All', ...Array.from(new Set(certificateGroups.map((certificate) => certificate.categoryGroup))).sort()], [certificateGroups]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(certificateGroups.filter((certificate) => selectedGroup === 'All' || certificate.categoryGroup === selectedGroup).map((certificate) => certificate.category))).sort()], [certificateGroups, selectedGroup]);
  const visibleCertificates = useMemo(() => certificateGroups
    .filter((certificate) => selectedGroup === 'All' || certificate.categoryGroup === selectedGroup)
    .filter((certificate) => selectedCategory === 'All' || certificate.category === selectedCategory)
    .sort((left, right) => {
      if (sortOrder === 'shortest' || sortOrder === 'longest') return ((left.durationMinutes ?? Number.MAX_SAFE_INTEGER) - (right.durationMinutes ?? Number.MAX_SAFE_INTEGER)) * (sortOrder === 'longest' ? -1 : 1);
      const leftDate = left.issuedAt ? new Date(left.issuedAt).getTime() : 0;
      const rightDate = right.issuedAt ? new Date(right.issuedAt).getTime() : 0;
      return sortOrder === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
    }), [certificateGroups, selectedGroup, selectedCategory, sortOrder]);
  const formatApproximateDate = (date: string | null) => date ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(date)) : 'Date not listed';
  const formatDuration = (minutes: number | null) => minutes ? minutes >= 60 ? `${minutes / 60} hours` : `${minutes} minutes` : 'Duration not listed';
  const certificateUrl = openCertificate?.url?.startsWith('/') ? `http://localhost:4000${openCertificate.url}` : openCertificate?.url;
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Certificates</span>
          <h2>Evidence and academic records</h2>
        </div>

        <div className="certificate-browser">
          <aside className="certificate-filters" aria-label="Certificate filters">
            <div className="filter-section"><strong>Category</strong>
              {groups.map((group) => <button className={selectedGroup === group ? 'filter-link active' : 'filter-link'} type="button" key={group} onClick={() => { setSelectedGroup(group); setSelectedCategory('All'); }}>{group}<span>{group === 'All' ? certificateGroups.length : certificateGroups.filter((certificate) => certificate.categoryGroup === group).length}</span></button>)}
            </div>
            {selectedGroup !== 'All' && <div className="filter-section subfilter"><strong>Specific topic</strong>{categories.map((category) => <button className={selectedCategory === category ? 'filter-link active' : 'filter-link'} type="button" key={category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>}
            <div className="filter-section"><label className="sort-label" htmlFor="certificate-sort">Sort by</label><select id="certificate-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="shortest">Shortest first</option><option value="longest">Longest first</option></select></div>
          </aside>
          <div className="certificate-results">
            <p className="results-count">{visibleCertificates.length} certificates</p>
            <div className="card-grid">
          {visibleCertificates.map((group) => (
            <article key={group.title} className="card">
              <div className="certificate-card-heading"><h3>{group.title}</h3><button className="certificate-eye" type="button" aria-label={group.url ? `Preview ${group.title}` : `${group.title} has no uploaded file`} title={group.url ? 'Preview certificate' : 'No certificate file uploaded'} disabled={!group.url} onClick={() => setOpenCertificate(group)}><Eye size={18} strokeWidth={2} /></button></div>
              {group.issuer && <span className="certificate-issuer">Issued by {group.issuer}</span>}
              <div className="certificate-meta"><span>{formatApproximateDate(group.issuedAt)}</span><span>{formatDuration(group.durationMinutes)}</span></div>
              <p>{group.description}</p>
              {group.url && <a className="nav-link" href={group.url} target="_blank" rel="noreferrer">View certificate</a>}
            </article>
          ))}
            </div>
          </div>
        </div>
        {visibleCertificates.length === 0 && <p>No certificates found in this category.</p>}
      </div>
      {openCertificate && certificateUrl && <div className="certificate-modal-backdrop" role="presentation" onClick={() => setOpenCertificate(null)}>
        <section className="certificate-modal" role="dialog" aria-modal="true" aria-labelledby="certificate-modal-title" onClick={(event) => event.stopPropagation()}>
          <div className="certificate-modal-header"><div><span className="section-eyebrow">Certificate preview</span><h2 id="certificate-modal-title">{openCertificate.title}</h2></div><button className="icon-close" type="button" aria-label="Close certificate preview" onClick={() => setOpenCertificate(null)}>×</button></div>
          <iframe className="certificate-frame" title={openCertificate.title} src={certificateUrl} />
        </section>
      </div>}
    </section>
  );
}
