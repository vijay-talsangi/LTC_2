import { useEffect, useState } from 'react';
import { getFacultyDashboard } from '../../api/faculty.api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatsCard from '../../components/StatsCard';
import { format } from 'date-fns';

const FacultyDashboard = () => {
  const { profile } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyDashboard()
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;

  const { faculty, studentCount, recentAttendanceDates } = data || {};

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>👋 Welcome, {faculty?.name || profile?.name}</h1>
        <p>Faculty Dashboard — {faculty?.department} | {faculty?.division}</p>
      </div>

      <div className="stats-grid stagger">
        <StatsCard icon="👥" value={studentCount}     label="Students in Panel" color="cyan" />
        <StatsCard icon="📅" value={recentAttendanceDates?.length} label="Sessions Recorded" color="indigo" />
        <StatsCard icon="🏛️" value={faculty?.panel  || '—'} label="Panel" color="green" />
        <StatsCard icon="🗂️" value={faculty?.department || '—'} label="Department" color="amber" />
      </div>

      {/* Profile card */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>👤 Your Profile</h3></div>
          <div className="card-body">
            {[
              ['Faculty ID',  faculty?.faculty_id  || '—'],
              ['Email',       faculty?.email       || '—'],
              ['Phone',       faculty?.phone       || '—'],
              ['Division',    faculty?.division    || '—'],
              ['School',      faculty?.school      || '—'],
              ['Department',  faculty?.department  || '—'],
              ['Panel',       faculty?.panel       || '—'],
              ['Role',        faculty?.role        || '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.55rem 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{label}</span>
                <span style={{ color:'var(--text-primary)', fontWeight:500, fontSize:'0.85rem' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="card">
          <div className="card-header"><h3>📅 Recent Sessions</h3></div>
          <div className="card-body">
            {!recentAttendanceDates?.length ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No sessions yet</h3>
                <p>Go to Mark Attendance to record your first session.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {recentAttendanceDates.map((d) => (
                  <div key={d.date} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'0.75rem 1rem', background:'var(--bg-elevated)',
                    borderRadius:'var(--radius-sm)', border:'1px solid var(--border)',
                  }}>
                    <span style={{ fontWeight:500, color:'var(--text-primary)' }}>
                      {format(new Date(d.date), 'dd MMM yyyy')}
                    </span>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <span className="badge badge-present">P: {d.present_count}</span>
                      <span className="badge badge-absent">A: {d.absent_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
