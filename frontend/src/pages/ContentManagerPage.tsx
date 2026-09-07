import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
type ContentType = 'projects' | 'certificates' | 'experience' | 'education';
type ContentItem = Record<string, string | number | boolean | null> & { id?: string };

const definitions: Record<ContentType, { title: string; fields: { key: string; label: string; type?: string }[] }> = {
  projects: { title: 'Projects', fields: [{ key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'stack', label: 'Stack (comma separated)' }, { key: 'featured', label: 'Featured', type: 'checkbox' }, { key: 'published', label: 'Published', type: 'checkbox' }] },
  certificates: { title: 'Certificates', fields: [{ key: 'title', label: 'Title' }, { key: 'categoryGroup', label: 'Main category' }, { key: 'category', label: 'Subcategory' }, { key: 'issuer', label: 'Issuer' }, { key: 'issuedAt', label: 'Date (YYYY-MM-DD)', type: 'date' }, { key: 'durationMinutes', label: 'Duration (minutes)', type: 'number' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'url', label: 'Certificate file path or URL', type: 'text' }] },
  experience: { title: 'Experience', fields: [{ key: 'title', label: 'Role' }, { key: 'company', label: 'Company' }, { key: 'location', label: 'Location' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'current', label: 'Current role', type: 'checkbox' }] },
  education: { title: 'Education', fields: [{ key: 'institution', label: 'Institution' }, { key: 'degree', label: 'Degree' }, { key: 'field', label: 'Field of study' }, { key: 'description', label: 'Description', type: 'textarea' }] },
};

const emptyItem = (type: ContentType): ContentItem => Object.fromEntries(definitions[type].fields.map(({ key, type: fieldType }) => [key, fieldType === 'checkbox' ? false : key === 'categoryGroup' ? 'AI & Technology' : '']));

export function ContentManagerPage() {
  const { type = 'projects' } = useParams<{ type: ContentType }>();
  const contentType = (type in definitions ? type : 'projects') as ContentType;
  const definition = definitions[contentType];
  const [items, setItems] = useState<ContentItem[]>([]);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [message, setMessage] = useState('');

  async function loadItems() {
    const response = await fetch(`${apiBaseUrl}/content/${contentType}?admin=true`, { credentials: 'include' });
    if (!response.ok) throw new Error('Unable to load content');
    const data = await response.json() as { items: ContentItem[] };
    setItems(data.items);
  }

  useEffect(() => { void loadItems().catch(() => setMessage('Unable to load this section.')); }, [contentType]);

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const payload = { ...editing };
    if (contentType === 'certificates') {
      payload.issuedAt = payload.issuedAt ? String(payload.issuedAt).slice(0, 10) : null;
      payload.durationMinutes = payload.durationMinutes ? Number(payload.durationMinutes) : null;
    }
    const method = editing.id ? 'PATCH' : 'POST';
    const url = editing.id ? `${apiBaseUrl}/content/${contentType}/${editing.id}` : `${apiBaseUrl}/content/${contentType}`;
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    const data = await response.json().catch(() => null) as { message?: string } | null;
    if (!response.ok) { setMessage(data?.message ?? 'Unable to save item.'); return; }
    setEditing(null); setMessage('Saved successfully.'); await loadItems();
  }

  async function deleteItem(id: string) {
    if (!window.confirm('Delete this item?')) return;
    const response = await fetch(`${apiBaseUrl}/content/${contentType}/${id}`, { method: 'DELETE', credentials: 'include' });
    setMessage(response.ok ? 'Deleted successfully.' : 'Unable to delete item.');
    if (response.ok) await loadItems();
  }

  return <section className="section"><div className="container admin-content-page">
    <div className="content-manager-heading"><div><Link className="back-link" to="/admin">← Admin workspace</Link><span className="section-eyebrow">Content management</span><h1>{definition.title}</h1><p>Create, update, publish, or remove public {definition.title.toLowerCase()}.</p></div><button className="btn primary" type="button" onClick={() => { setEditing(emptyItem(contentType)); setMessage(''); }}>Add {definition.title.slice(0, -1)}</button></div>
    {message && <p className="manager-message" role="status">{message}</p>}
    <div className="manager-list">{items.length === 0 && <div className="card"><p>No items yet. Add the first one.</p></div>}{items.map((item) => <article className="manager-row" key={item.id}><div><strong>{String(item.title ?? item.name ?? item.institution ?? 'Untitled')}</strong><span>{String(item.type ?? item.category ?? item.degree ?? '')}</span></div><div className="row-actions"><button className="btn secondary" type="button" onClick={() => setEditing(item)}>Edit</button><button className="btn danger" type="button" onClick={() => item.id && void deleteItem(item.id)}>Delete</button></div></article>)}</div>
    {editing && <div className="editor-panel"><div className="panel-heading"><div><span className="section-eyebrow">Editor</span><h2>{editing.id ? 'Edit item' : 'New item'}</h2></div><button className="icon-close" type="button" aria-label="Close editor" onClick={() => setEditing(null)}>×</button></div><form className="content-form" onSubmit={saveItem}>{definition.fields.map((field) => field.type === 'checkbox' ? <label className="checkbox-field" key={field.key}><input type="checkbox" checked={Boolean(editing[field.key])} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.checked })} />{field.label}</label> : <label key={field.key}>{field.label}{field.type === 'textarea' ? <textarea rows={5} value={String(editing[field.key] ?? '')} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })} /> : <input type={field.type ?? 'text'} value={field.type === 'date' && editing[field.key] ? String(editing[field.key]).slice(0, 10) : String(editing[field.key] ?? '')} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })} />}</label>)}<div className="form-actions"><button className="btn secondary" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="btn primary" type="submit">Save item</button></div></form></div>}
  </div></section>;
}
