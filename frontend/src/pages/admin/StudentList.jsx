import { useEffect, useState, useCallback } from 'react';
import { getStudentList } from '../../api/admin.api';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentList = () => {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentList({ page, limit, search });
      setData(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>🎓 Student List</h1>
        <p>{total} total students</p>
      </div>

      <div className="filter-row">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>🔄 Refresh</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? <LoadingSpinner /> : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Division</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Panel</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No students found</td></tr>
                ) : data.map((s, i) => (
                  <tr key={s.id} className="fade-in">
                    <td style={{ color:'var(--text-muted)' }}>{(page-1)*limit + i + 1}</td>
                    <td style={{ fontWeight:600 }}>{s.name}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{s.email}</td>
                    <td>{s.division || '—'}</td>
                    <td>{s.school || '—'}</td>
                    <td>{s.department || '—'}</td>
                    <td>
                      {s.panel
                        ? <span className="badge badge-info">{s.panel}</span>
                        : <span style={{ color:'var(--text-subtle)' }}>Unassigned</span>}
                    </td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
                      {new Date(s.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div style={{ padding:'1rem 1.5rem', display:'flex', gap:'0.5rem', justifyContent:'flex-end', borderTop:'1px solid var(--border)' }}>
            <button className="btn btn-secondary btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
            <span style={{ display:'flex', alignItems:'center', fontSize:'0.8rem', color:'var(--text-muted)', padding:'0 0.5rem' }}>
              {page} / {pages}
            </span>
            <button className="btn btn-secondary btn-sm" disabled={page>=pages} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
