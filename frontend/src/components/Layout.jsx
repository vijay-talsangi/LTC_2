import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, profile } = useAuth();

  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const displayName = profile?.name || user?.email;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">
            Welcome back, <strong>{displayName}</strong>
          </span>
          <span className="topbar-meta">{now}</span>
        </header>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
