import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { apiBaseUrl } from '../api';

type LoginLocationState = {
  from?: { pathname?: string };
};

export function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as LoginLocationState | null)?.from?.pathname ?? '/admin';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(data?.message ?? 'Unable to sign in');
      }

      await refresh();
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section auth-section">
      <div className="container auth-container">
        <div className="section-header">
          <span className="section-eyebrow">Private access</span>
          <h1>Sign in to manage the portfolio</h1>
          <p>Use an administrator account to continue to the dashboard.</p>
        </div>

        <form className="card auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
          <Link className="nav-link" to="/forgot-password">Forgot password?</Link>
          <a className="btn secondary" href={`${apiBaseUrl}/auth/google`}>Continue with Google</a>
        </form>
      </div>
    </section>
  );
}
