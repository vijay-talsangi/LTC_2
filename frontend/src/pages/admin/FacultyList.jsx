import { useEffect, useState, useCallback } from 'react';
import { getFacultyList } from '../../api/admin.api';
import LoadingSpinner from '../../components/LoadingSpinner';

const FacultyList = () => {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFacultyList({ page, limit, search });
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
        <h1>👨‍🏫 Faculty List</h1>
        <p>{total} total faculty members</p>
      </div>

      <div className="filter-row">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search by name, email or ID…"
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
                  <th>Faculty ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Division</th>
                  <th>Department</th>
                  <th>Panel</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No faculty found</td></tr>
                ) : data.map((f, i) => (
                  <tr key={f.id} className="fade-in">
                    <td style={{ color:'var(--text-muted)' }}>{(page-1)*limit + i + 1}</td>
                    <td><span className="badge badge-primary">{f.faculty_id || '—'}</span></td>
                    <td style={{ fontWeight:600 }}>{f.name}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{f.email}</td>
                    <td style={{ color:'var(--text-muted)' }}>{f.phone || '—'}</td>
                    <td>{f.division || '—'}</td>
                    <td>{f.department || '—'}</td>
                    <td>
                      {f.panel
                        ? <span className="badge badge-info">{f.panel}</span>
                        : <span style={{ color:'var(--text-subtle)' }}>Unassigned</span>}
                    </td>
                    <td><span className="badge badge-primary">{f.role || '—'}</span></td>
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

export default FacultyList;
