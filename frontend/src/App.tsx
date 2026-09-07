import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { useAuth } from './auth';
import { ContentManagerPage } from './pages/ContentManagerPage';

function ProtectedAdminRoute() {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) return <section className="section"><div className="container"><p>Checking access...</p></div></section>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" replace state={{ from: location }} />;
  return location.pathname === '/admin' ? <AdminDashboardPage /> : <ContentManagerPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
        <Route path="/admin/:type" element={<ProtectedAdminRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
