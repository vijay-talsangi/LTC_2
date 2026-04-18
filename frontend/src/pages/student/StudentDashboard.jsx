import { useEffect, useState } from 'react';
import { getStudentDashboard, getStudentAttendance } from '../../api/student.api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatsCard from '../../components/StatsCard';
import { format } from 'date-fns';

const CircularProgress = ({ percentage = 0 }) => {
  const r   = 52;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(100, parseFloat(percentage) || 0));
  const offset = circ - (pct / 100) * circ;
  const color  = pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="circle-progress">
      <svg width="130" height="130" className="circle-svg">
        <circle className="circle-track" cx="65" cy="65" r={r} strokeWidth="10" />
        <circle
          className="circle-fill"
          cx="65" cy="65" r={r}
          strokeWidth="10"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ marginTop:'-80px', textAlign:'center' }}>
        <div className="circle-value">{pct}%</div>
        <div className="circle-label">Attendance</div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [data,           setData]     = useState(null);
  const [allAttendance,  setAllAtt]   = useState([]);
  const [loading,        setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getStudentDashboard(), getStudentAttendance()])
      .then(([dash, att]) => {
        setData(dash.data.data);
        setAllAtt(att.data.data.records || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard…" />;

  const { student, attendanceSummary: summary } = data || {};

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>🎓 My Dashboard</h1>
        <p>{student?.department} · {student?.panel} · {student?.division}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
        {/* Circular attendance */}
        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <CircularProgress percentage={summary?.percentage} />
          <div style={{ marginTop:'1.5rem', width:'100%' }}>
            {[
              { label:'Total Classes', value: summary?.total     || 0, color:'var(--text-primary)' },
              { label:'Present',       value: summary?.present_count || 0, color:'var(--success)' },
              { label:'Absent',        value: summary?.absent_count  || 0, color:'var(--danger)' },
            ].map((s) => (
              <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{s.label}</span>
                <span style={{ fontWeight:700, color:s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile info */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="stats-grid" style={{ gridTemplateColumns:'1fr 1fr', marginBottom:0 }}>
            <StatsCard icon="👨‍🏫" value={student?.faculty_name || '—'} label="Assigned Faculty" color="indigo" />
            <StatsCard icon="👥" value={student?.panel_name   || student?.panel || '—'} label="Panel" color="cyan" />
          </div>

          <div className="card" style={{ flex:1 }}>
            <div className="card-header"><h3>👤 My Profile</h3></div>
            <div className="card-body">
              {[
                ['Name',       student?.name       || '—'],
                ['Email',      student?.email      || '—'],
                ['Division',   student?.division   || '—'],
                ['School',     student?.school     || '—'],
                ['Department', student?.department || '—'],
                ['Panel',      student?.panel      || '—'],
                ['Faculty',    student?.faculty_name || '—'],
                ['Faculty Email', student?.faculty_email || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{label}</span>
                  <span style={{ color:'var(--text-primary)', fontWeight:500, fontSize:'0.82rem' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance history */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Attendance History</h3>
          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{allAttendance.length} records</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {allAttendance.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
                    No attendance records found
                  </td>
                </tr>
              ) : allAttendance.map((a, i) => (
                <tr key={a.id}>
                  <td style={{ color:'var(--text-muted)' }}>{i+1}</td>
                  <td style={{ fontWeight:500 }}>
                    {format(new Date(a.date), 'dd MMM yyyy')}
                  </td>
                  <td>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </td>
                  <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
                    {a.faculty_name || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
