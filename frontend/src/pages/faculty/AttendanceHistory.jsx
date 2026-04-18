import { useEffect, useState } from 'react';
import { getAttendanceDates, getAttendanceForDate } from '../../api/faculty.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const AttendanceHistory = () => {
  const [dates,      setDates]      = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [records,    setRecords]    = useState([]);
  const [loadingD,   setLoadingD]   = useState(true);
  const [loadingR,   setLoadingR]   = useState(false);

  useEffect(() => {
    getAttendanceDates()
      .then((r) => setDates(r.data.data || []))
      .finally(() => setLoadingD(false));
  }, []);

  const viewDate = async (dateStr) => {
    setSelected(dateStr);
    setLoadingR(true);
    try {
      const res = await getAttendanceForDate(dateStr);
      setRecords(res.data.data.records || []);
    } catch (e) { setRecords([]); }
    finally { setLoadingR(false); }
  };

  if (loadingD) return <LoadingSpinner />;

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>📅 Attendance Sessions</h1>
        <p>View past attendance records by date</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.5rem' }}>
        {/* Date list */}
        <div className="card">
          <div className="card-header"><h3>Sessions ({dates.length})</h3></div>
          <div style={{ padding:'0.5rem' }}>
            {dates.length === 0
              ? <div className="empty-state" style={{ padding:'2rem' }}><p>No sessions yet</p></div>
              : dates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => viewDate(d.date)}
                  style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    width:'100%', padding:'0.75rem 1rem',
                    background: selected === d.date ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: selected === d.date ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    borderRadius:'var(--radius-sm)', cursor:'pointer',
                    marginBottom:'0.25rem', transition:'all 0.15s',
                    color: selected === d.date ? 'var(--primary-light)' : 'var(--text-primary)',
                    fontFamily:'inherit', fontSize:'0.875rem',
                  }}
                >
                  <span style={{ fontWeight:500 }}>
                    {format(new Date(d.date), 'dd MMM yyyy')}
                  </span>
                  <div style={{ display:'flex', gap:'0.35rem' }}>
                    <span className="badge badge-present">{d.present_count}</span>
                    <span className="badge badge-absent">{d.absent_count}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Records for selected date */}
        <div className="card">
          <div className="card-header">
            <h3>
              {selected
                ? `📋 ${format(new Date(selected), 'dd MMMM yyyy')}`
                : 'Select a session'}
            </h3>
          </div>
          {!selected ? (
            <div className="empty-state">
              <div className="empty-icon">←</div>
              <h3>Select a date</h3>
              <p>Click a session on the left to view attendance records</p>
            </div>
          ) : loadingR ? (
            <LoadingSpinner />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.student_id}>
                      <td style={{ color:'var(--text-muted)' }}>{i+1}</td>
                      <td style={{ fontWeight:500 }}>{r.student_name}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{r.student_email}</td>
                      <td>
                        {r.status
                          ? <span className={`badge badge-${r.status}`}>{r.status}</span>
                          : <span style={{ color:'var(--text-subtle)', fontSize:'0.8rem' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
