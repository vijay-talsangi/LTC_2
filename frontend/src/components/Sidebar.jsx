import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_CONFIG = {
  admin: [
    { to: '/admin',           icon: '📊', label: 'Dashboard'  },
    { to: '/admin/upload',    icon: '📤', label: 'Upload Sheets' },
    { to: '/admin/hierarchy', icon: '🏛️', label: 'Hierarchy'  },
    { to: '/admin/faculty',   icon: '👨‍🏫', label: 'Faculty'    },
    { to: '/admin/students',  icon: '🎓', label: 'Students'   },
  ],
  faculty: [
    { to: '/faculty',            icon: '📋', label: 'Dashboard'       },
    { to: '/faculty/attendance', icon: '✅', label: 'Mark Attendance' },
    { to: '/faculty/history',    icon: '📅', label: 'Attendance Dates'},
  ],
  student: [
    { to: '/student', icon: '🏠', label: 'My Dashboard' },
  ],
};

const Sidebar = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems  = NAV_CONFIG[user?.role] || [];
  const initials  = (profile?.name || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayName = profile?.name || user?.email || 'User';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">L</div>
          <div className="logo-text">
            LTCC Portal
            <span>Campus Management System</span>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className={`sidebar-role-badge badge-${user?.role}`}>
        {user?.role === 'admin'   && '⚙️ Administrator'}
        {user?.role === 'faculty' && '👨‍🏫 Faculty'}
        {user?.role === 'student' && '🎓 Student'}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/faculty' || item.to === '/student'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
