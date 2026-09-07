import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? 'Unable to request password recovery');
      setMessage(data?.message ?? 'If that account exists, recovery instructions have been sent.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to request password recovery');
    } finally {
      setIsSubmitting(false);
    }
  }

  return <section className="section auth-section"><div className="container auth-container">
    <div className="section-header"><span className="section-eyebrow">Account recovery</span><h1>Reset your password</h1><p>Enter your account email and we will send recovery instructions.</p></div>
    <form className="card auth-form" onSubmit={handleSubmit}>
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
      {message && <p role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send recovery email'}</button>
      <Link className="nav-link" to="/login">Back to sign in</Link>
    </form>
  </div></section>;
}
