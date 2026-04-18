import { useEffect, useState } from 'react';
import { getPanelStudents, markAttendance, getAttendanceForDate } from '../../api/faculty.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AttendanceMark = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date,           setDate]          = useState(today);
  const [students,       setStudents]      = useState([]);
  const [attendance,     setAttendance]    = useState({});  // { student_id: 'present'|'absent' }
  const [loadingStudents, setLoadingS]     = useState(true);
  const [loadingAtt,     setLoadingAtt]    = useState(false);
  const [saving,         setSaving]        = useState(false);

  // Load panel students once
  useEffect(() => {
    getPanelStudents()
      .then((r) => setStudents(r.data.data.students || []))
      .catch((e) => toast.error(e.response?.data?.message || 'Failed to load students'))
      .finally(() => setLoadingS(false));
  }, []);

  // Load existing attendance when date changes
  useEffect(() => {
    if (!date) return;
    setLoadingAtt(true);
    getAttendanceForDate(date)
      .then((r) => {
        const existing = {};
        (r.data.data.records || []).forEach((rec) => {
          if (rec.status) existing[rec.student_id] = rec.status;
        });
        setAttendance(existing);
      })
      .catch(() => setAttendance({}))
      .finally(() => setLoadingAtt(false));
  }, [date]);

  const toggle = (studentId, status) =>
    setAttendance((prev) => ({ ...prev, [studentId]: status }));

  const markAll = (status) => {
    const all = {};
    students.forEach((s) => { all[s.id] = status; });
    setAttendance(all);
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount  = Object.values(attendance).filter(v => v === 'absent').length;
  const markedCount  = presentCount + absentCount;

  const handleSave = async () => {
    if (markedCount === 0) { toast.error('Mark at least one student'); return; }
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([sid, status]) => ({
        student_id: parseInt(sid),
        status,
      }));
      const res = await markAttendance({ date, records });
      toast.success(res.data.message || 'Attendance saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loadingStudents) return <LoadingSpinner text="Loading students…" />;

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>✅ Mark Attendance</h1>
        <p>Toggle Present / Absent for each student and save</p>
      </div>

      {/* Date & summary bar */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
          <div className="form-group" style={{ marginBottom:0, minWidth:180 }}>
            <label className="form-label">Session Date</label>
            <input
              id="attendance-date"
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
            />
          </div>

          <div style={{ display:'flex', gap:'0.75rem', flex:1, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ padding:'0.5rem 1rem', background:'rgba(16,185,129,0.12)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(16,185,129,0.25)' }}>
              <span style={{ color:'var(--success)', fontWeight:700 }}>{presentCount}</span>
              <span style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginLeft:'0.4rem' }}>Present</span>
            </div>
            <div style={{ padding:'0.5rem 1rem', background:'rgba(239,68,68,0.1)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(239,68,68,0.2)' }}>
              <span style={{ color:'var(--danger)', fontWeight:700 }}>{absentCount}</span>
              <span style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginLeft:'0.4rem' }}>Absent</span>
            </div>
            <div style={{ padding:'0.5rem 1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text-primary)', fontWeight:700 }}>{students.length - markedCount}</span>
              <span style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginLeft:'0.4rem' }}>Unmarked</span>
            </div>

            <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem' }}>
              <button className="btn btn-success btn-sm" onClick={() => markAll('present')}>Mark All Present</button>
              <button className="btn btn-danger btn-sm"  onClick={() => markAll('absent')}>Mark All Absent</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setAttendance({})}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {students.length > 0 && (
        <div style={{ marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.4rem' }}>
            <span>Marking progress</span>
            <span>{markedCount} / {students.length}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${(markedCount/students.length)*100}%` }} />
          </div>
        </div>
      )}

      {/* Student table */}
      <div className="card">
        <div className="table-wrapper">
          {loadingAtt ? <LoadingSpinner text="Loading existing records…" /> : (
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
                {students.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No students in your panel</td></tr>
                ) : students.map((s, i) => {
                  const status = attendance[s.id];
                  return (
                    <tr key={s.id}>
                      <td style={{ color:'var(--text-muted)', width:50 }}>{i+1}</td>
                      <td style={{ fontWeight:500 }}>{s.name}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{s.email}</td>
                      <td>
                        <div className="attendance-toggle">
                          <button
                            className={`att-btn present ${status === 'present' ? 'active' : ''}`}
                            onClick={() => toggle(s.id, 'present')}
                          >
                            ✓ Present
                          </button>
                          <button
                            className={`att-btn absent ${status === 'absent' ? 'active' : ''}`}
                            onClick={() => toggle(s.id, 'absent')}
                          >
                            ✗ Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {students.length > 0 && (
          <div style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'flex-end', borderTop:'1px solid var(--border)' }}>
            <button
              id="save-attendance-btn"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || markedCount === 0}
            >
              {saving
                ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Saving…</>
                : `💾 Save Attendance (${markedCount} records)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceMark;
