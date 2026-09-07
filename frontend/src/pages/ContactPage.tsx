import { FormEvent, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', company: '', opportunityType: '', message: '' });
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus('');
    try {
      const response = await fetch(`${apiBaseUrl}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? 'Unable to send your message.');
      setStatus(data?.message ?? 'Your message has been sent.');
      setForm({ name: '', email: '', subject: '', company: '', opportunityType: '', message: '' });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to send your message.');
    } finally { setIsSending(false); }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Contact</span>
          <h2>Get in touch</h2>
        </div>

        <form className="card contact-form" onSubmit={submitForm}>
          <div className="contact-fields">
            <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Subject<input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
            <label>Company <span>(optional)</span><input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></label>
            <label>Opportunity type <span>(optional)</span><input value={form.opportunityType} onChange={(event) => setForm({ ...form, opportunityType: event.target.value })} /></label>
            <label className="field-wide">Message<textarea required rows={7} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>
          </div>
          {status && <p role="status">{status}</p>}
          <button className="btn primary" type="submit" disabled={isSending}>{isSending ? 'Sending...' : 'Send message'}</button>
        </form>
      </div>
    </section>
  );
}
