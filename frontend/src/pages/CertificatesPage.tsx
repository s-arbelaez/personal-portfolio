import { useEffect, useMemo, useState } from 'react';
import { Eye, Filter } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');
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
  const [selectedIssuer, setSelectedIssuer] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [fileStatus, setFileStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [openCertificate, setOpenCertificate] = useState<Certificate | null>(null);
  useEffect(() => { fetch(`${apiBaseUrl}/content/certificates`).then((response) => response.json()).then((data: { items: Certificate[] }) => setCertificateGroups(data.items)).catch(() => setCertificateGroups([])); }, []);
  useEffect(() => {
    if (!openCertificate) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenCertificate(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [openCertificate]);
  const getPlatform = (url: string | null): string | null => {
    if (!url) return null;
    const fileName = decodeURIComponent(url.split('/').pop() ?? '');
    if (/^Coursera\s+[^/]+\.pdf$/i.test(fileName)) return 'Coursera';
    if (/^\d+_[^/]+\.pdf$/i.test(fileName)) return 'Santander Open Academy';
    return null;
  };
  const groups = useMemo(() => ['All', ...Array.from(new Set(certificateGroups.map((certificate) => certificate.categoryGroup))).sort()], [certificateGroups]);
  const issuers = useMemo(() => ['All', ...Array.from(new Set(certificateGroups.map((certificate) => certificate.issuer).filter((issuer): issuer is string => Boolean(issuer)))).sort()], [certificateGroups]);
  const platforms = useMemo(() => ['All', ...Array.from(new Set(certificateGroups.map((certificate) => getPlatform(certificate.url)).filter((platform): platform is string => Boolean(platform)))).sort()], [certificateGroups]);
  const matchesAdditionalFilters = (certificate: Certificate) => (selectedIssuer === 'All' || certificate.issuer === selectedIssuer)
    && (selectedPlatform === 'All' || getPlatform(certificate.url) === selectedPlatform)
    && (fileStatus === 'all' || (fileStatus === 'uploaded' ? Boolean(certificate.url) : !certificate.url));
  const categories = useMemo(() => ['All', ...Array.from(new Set(certificateGroups.filter((certificate) => (selectedGroup === 'All' || certificate.categoryGroup === selectedGroup) && matchesAdditionalFilters(certificate)).map((certificate) => certificate.category))).sort()], [certificateGroups, selectedGroup, selectedIssuer, selectedPlatform, fileStatus]);
  const visibleCertificates = useMemo(() => certificateGroups
    .filter((certificate) => selectedGroup === 'All' || certificate.categoryGroup === selectedGroup)
    .filter((certificate) => selectedCategory === 'All' || certificate.category === selectedCategory)
    .filter(matchesAdditionalFilters)
    .sort((left, right) => {
      if (sortOrder === 'shortest' || sortOrder === 'longest') return ((left.durationMinutes ?? Number.MAX_SAFE_INTEGER) - (right.durationMinutes ?? Number.MAX_SAFE_INTEGER)) * (sortOrder === 'longest' ? -1 : 1);
      const leftDate = left.issuedAt ? new Date(left.issuedAt).getTime() : 0;
      const rightDate = right.issuedAt ? new Date(right.issuedAt).getTime() : 0;
      return sortOrder === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
    }), [certificateGroups, selectedGroup, selectedCategory, selectedIssuer, selectedPlatform, fileStatus, sortOrder]);
  const formatApproximateDate = (date: string | null) => date ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(date)) : 'Date not listed';
  const formatDuration = (minutes: number | null) => minutes ? minutes >= 60 ? `${minutes / 60} hours` : `${minutes} minutes` : 'Duration not listed';
  const getCertificateUrl = (url: string | null) => url?.startsWith('/') ? `${apiOrigin}${encodeURI(url)}` : url;
  const certificateUrl = getCertificateUrl(openCertificate?.url ?? null);
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Certificates</span>
          <h2>Evidence and academic records</h2>
        </div>
        <div className="certificate-toolbar">
          <label className="certificate-sort-control" htmlFor="certificate-sort"><Filter size={16} strokeWidth={2} aria-hidden="true" /><span>Sort by</span><select id="certificate-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="shortest">Shortest first</option><option value="longest">Longest first</option></select></label>
        </div>

        <div className="certificate-browser">
          <aside className="certificate-filters" aria-label="Certificate filters">
            <div className="filter-section"><strong>Category</strong>
              {groups.map((group) => <button className={selectedGroup === group ? 'filter-link active' : 'filter-link'} type="button" key={group} onClick={() => { setSelectedGroup(group); setSelectedCategory('All'); }}>{group}<span>{group === 'All' ? certificateGroups.length : certificateGroups.filter((certificate) => certificate.categoryGroup === group).length}</span></button>)}
            </div>
            {selectedGroup !== 'All' && <div className="filter-section subfilter"><strong>Specific topic</strong>{categories.map((category) => <button className={selectedCategory === category ? 'filter-link active' : 'filter-link'} type="button" key={category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>}
            <div className="filter-section"><label className="sort-label" htmlFor="certificate-issuer">Issuer</label><select id="certificate-issuer" value={selectedIssuer} onChange={(event) => { setSelectedIssuer(event.target.value); setSelectedCategory('All'); }}>{issuers.map((issuer) => <option value={issuer} key={issuer}>{issuer}</option>)}</select></div>
            <div className="filter-section"><label className="sort-label" htmlFor="certificate-platform">Platform</label><select id="certificate-platform" value={selectedPlatform} onChange={(event) => { setSelectedPlatform(event.target.value); setSelectedCategory('All'); }}>{platforms.map((platform) => <option value={platform} key={platform}>{platform}</option>)}</select></div>
            <div className="filter-section"><label className="sort-label" htmlFor="certificate-file-status">Certificate file</label><select id="certificate-file-status" value={fileStatus} onChange={(event) => setFileStatus(event.target.value)}><option value="all">All certificates</option><option value="uploaded">Uploaded files only</option><option value="missing">Without uploaded file</option></select></div>
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
              {group.url && <a className="nav-link" href={getCertificateUrl(group.url) ?? undefined} target="_blank" rel="noreferrer">View certificate</a>}
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
