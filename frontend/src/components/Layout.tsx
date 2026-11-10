import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../auth';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch (error) {
    console.warn('Unable to read the saved appearance preference', error);
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function Layout() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171817' : '#f0ede6');
    try {
      window.localStorage.setItem('portfolio-theme', theme);
    } catch (error) {
      console.warn('Unable to save the appearance preference', error);
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="container navbar">
          <Link to="/" className="brand">Sofía Arbeláez Mejía</Link>
          <div className="nav-actions">
            <nav className="nav-links" aria-label="Main navigation">
              <NavLink className="nav-link" to="/">Home</NavLink>
              <NavLink className="nav-link" to="/projects">Projects</NavLink>
              <NavLink className="nav-link" to="/certificates">Certificates</NavLink>
              <NavLink className="nav-link" to="/availability">Availability</NavLink>
              <NavLink className="nav-link" to="/contact">Contact</NavLink>
              {user?.role === 'ADMIN' && <NavLink className="nav-link" to="/admin">Admin</NavLink>}
            </nav>
            <button
              className="theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'dark'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>© 2026 Sofía Arbeláez Mejía · Data Science &amp; Computer Engineering</p>
          <Link className="footer-link" to="/">Back to the beginning ↑</Link>
        </div>
      </footer>
    </>
  );
}
