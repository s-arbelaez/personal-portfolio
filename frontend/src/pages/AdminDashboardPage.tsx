import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

type Profile = { fullName: string; headline: string; bio: string; location: string | null; email: string | null; linkedinUrl: string | null; githubUrl: string | null; avatarUrl: string | null };

const sections = ['Overview', 'Projects', 'Certificates', 'Availability'];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    fetch(`${apiBaseUrl}/profile`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load profile');
        const data = await response.json() as { profile: Profile };
        setProfile(data.profile);
      })
      .catch(() => setProfileMessage('Unable to load profile. Check that the backend and database are available.'));
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    try {
      const response = await fetch(`${apiBaseUrl}/profile`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(profile) });
      const data = await response.json().catch(() => null) as { message?: string; issues?: { fieldErrors?: Record<string, string[]> } } | null;
      if (!response.ok) {
        const fieldErrors = Object.values(data?.issues?.fieldErrors ?? {}).flat();
        throw new Error(fieldErrors[0] ?? data?.message ?? 'Unable to save profile.');
      }
      setProfileMessage('Profile saved.');
    } catch (saveError) {
      setProfileMessage(saveError instanceof Error ? saveError.message : 'Unable to save profile.');
    }
  }

  async function handleLogout() {
    await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    navigate('/login', { replace: true });
  }

  return (
    <section className="section">
      <div className="container">
        <div className="admin-heading">
          <div><span className="section-eyebrow">Admin workspace</span><h1>Portfolio control room</h1><p>Manage the information visitors see on your portfolio.</p></div>
          <button className="btn secondary" type="button" onClick={handleLogout}>Sign out</button>
        </div>

        <div className="admin-layout">
          <aside className="admin-sidebar" aria-label="Admin sections">
            <span className="admin-sidebar-title">Workspace</span>
            {sections.map((section, index) => section === 'Overview'
              ? <button className={index === 0 ? 'admin-nav active' : 'admin-nav'} type="button" key={section} onClick={() => document.getElementById('profile-editor')?.scrollIntoView({ behavior: 'smooth' })}>{section}<span>›</span></button>
              : <a className="admin-nav" href={`/admin/${section.toLowerCase()}`} key={section}>{section}<span>›</span></a>)}
          </aside>

          <div className="admin-content">
            <div className="admin-stats"><div><span>Published profile</span><strong>{profile ? 'Ready' : 'Loading'}</strong></div><div><span>Account</span><strong>Administrator</strong></div></div>
            <form className="profile-editor" id="profile-editor" onSubmit={saveProfile}>
              <div className="panel-heading"><div><span className="section-eyebrow">Profile</span><h2>Edit public profile</h2></div><span className="status-dot">● Live</span></div>
              <div className="profile-fields">
                {profile && <>
                  <label>Full name<input value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} /></label>
                  <label>Email<input type="email" value={profile.email ?? ''} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
                  <label className="field-wide">Headline<input value={profile.headline} onChange={(event) => setProfile({ ...profile, headline: event.target.value })} /></label>
                  <label className="field-wide">Bio<textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} rows={6} /></label>
                  <label>Location<input value={profile.location ?? ''} onChange={(event) => setProfile({ ...profile, location: event.target.value || null })} /></label>
                  <label>LinkedIn URL<input type="url" placeholder="https://linkedin.com/in/your-name" value={profile.linkedinUrl ?? ''} onChange={(event) => setProfile({ ...profile, linkedinUrl: event.target.value || null })} /></label>
                  <label>GitHub URL<input type="url" placeholder="https://github.com/your-name" value={profile.githubUrl ?? ''} onChange={(event) => setProfile({ ...profile, githubUrl: event.target.value || null })} /></label>
                </>}
              </div>
              <div className="form-actions">{profileMessage && <p role="status">{profileMessage}</p>}<button className="btn primary" type="submit" disabled={!profile}>Save changes</button></div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
