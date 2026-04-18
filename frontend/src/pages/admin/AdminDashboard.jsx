import { useEffect, useState } from 'react';
import { getStats, getHierarchy } from '../../api/admin.api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const HierarchyNode = ({ node }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="h-node h-division">
      <div className="h-node-label" onClick={() => setOpen(!open)}>
        {open ? '▾' : '▸'} 🏛️ {node.name}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
          Division
        </span>
      </div>
      {open && node.schools?.map((sch) => (
        <div key={sch.id} className="h-node h-school">
          <div className="h-node-label">📚 {sch.name}
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>School</span>
          </div>
          {sch.departments?.map((dept) => (
            <div key={dept.id} className="h-node h-department">
              <div className="h-node-label">🗂️ {dept.name}
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Dept</span>
              </div>
              {dept.panels?.map((panel) => (
                <div key={panel.id} className="h-node h-panel">
                  <div className="h-node-label">👥 {panel.name}
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Panel</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, h] = await Promise.all([getStats(), getHierarchy()]);
        setStats(s.data.data);
        setHierarchy(h.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your campus management system</p>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger">
        <StatsCard icon="🎓" value={stats?.totalStudents} label="Total Students" color="cyan" />
        <StatsCard icon="👨‍🏫" value={stats?.totalFaculty}  label="Total Faculty"  color="indigo" />
        <StatsCard icon="👥" value={stats?.totalPanels}   label="Total Panels"   color="green" />
        <StatsCard icon="🏛️" value={hierarchy.length}     label="Divisions"      color="amber" />
      </div>

      {/* Hierarchy tree */}
      <div className="card">
        <div className="card-header">
          <h3>📊 Division → School → Department → Panel</h3>
        </div>
        <div className="card-body">
          {hierarchy.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏛️</div>
              <h3>No hierarchy yet</h3>
              <p>Upload a Faculty or Student sheet to auto-create hierarchy nodes.</p>
            </div>
          ) : (
            <div className="hierarchy-tree">
              {hierarchy.map((div) => (
                <HierarchyNode key={div.id} node={div} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
