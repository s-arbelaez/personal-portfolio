import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

export function Layout() {
  const { user } = useAuth();

  return (
    <>
      <header className="site-header">
        <div className="container navbar">
          <Link to="/" className="brand">Sofía Arbeláez Mejía</Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link className="nav-link" to="/">Home</Link>
            <Link className="nav-link" to="/projects">Projects</Link>
            <Link className="nav-link" to="/certificates">Certificates</Link>
            <Link className="nav-link" to="/availability">Availability</Link>
            <Link className="nav-link" to="/contact">Contact</Link>
            {user?.role === 'ADMIN' && <Link className="nav-link" to="/admin">Admin</Link>}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 Sofía Arbeláez Mejía — Data Science Student | Computer Engineering</p>
        </div>
      </footer>
    </>
  );
}
