import { useEffect, useState } from 'react';
import { getHierarchy, createHierarchyNode, getPanels } from '../../api/admin.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageHierarchy = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools,   setSchools]   = useState([]);
  const [depts,     setDepts]     = useState([]);
  const [loading, setLoading]     = useState(true);

  const [form, setForm] = useState({ type: 'division', name: '', parent_id: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHierarchy();
      const tree = res.data.data;
      setHierarchy(tree);

      // Flatten for selects
      const divs = tree.map((d) => ({ id: d.id, name: d.name }));
      const schs  = tree.flatMap((d) => d.schools?.map((s) => ({ id: s.id, name: `${d.name} → ${s.name}`, div_id: d.id })) || []);
      const dps   = schs.flatMap((s) => {
        const div = tree.find((d) => d.schools?.some((ss) => ss.id === s.id));
        const sch = div?.schools?.find((ss) => ss.id === s.id);
        return (sch?.departments || []).map((dep) => ({ id: dep.id, name: `${s.name} → ${dep.name}` }));
      });

      setDivisions(divs);
      setSchools(schs);
      setDepts(dps);
    } catch (e) { toast.error('Failed to load hierarchy'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const getParentOptions = () => {
    if (form.type === 'school')     return divisions;
    if (form.type === 'department') return schools;
    if (form.type === 'panel')      return depts;
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    if (form.type !== 'division' && !form.parent_id) { toast.error('Please select a parent'); return; }
    setSaving(true);
    try {
      await createHierarchyNode({
        type:      form.type,
        name:      form.name,
        parent_id: form.parent_id ? parseInt(form.parent_id) : undefined,
      });
      toast.success(`${form.type} created/found: "${form.name}"`);
      setForm({ type: form.type, name: '', parent_id: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const renderTree = (nodes) => nodes.map((div) => (
    <div key={div.id} style={{ marginBottom: '0.75rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.75rem', background:'rgba(99,102,241,0.1)', borderRadius:'var(--radius-sm)', fontWeight:700, color:'var(--primary-light)' }}>
        🏛️ {div.name}
      </div>
      {div.schools?.map((sch) => (
        <div key={sch.id} style={{ marginLeft:'1.25rem', marginTop:'0.4rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.75rem', background:'rgba(34,211,238,0.08)', borderRadius:'var(--radius-sm)', fontWeight:600, color:'var(--secondary)' }}>
            📚 {sch.name}
          </div>
          {sch.departments?.map((dept) => (
            <div key={dept.id} style={{ marginLeft:'1.25rem', marginTop:'0.3rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.35rem 0.75rem', background:'var(--bg-card)', borderRadius:'var(--radius-sm)', fontWeight:500, color:'var(--text-primary)' }}>
                🗂️ {dept.name}
              </div>
              {dept.panels?.map((p) => (
                <div key={p.id} style={{ marginLeft:'1.25rem', marginTop:'0.25rem', display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.3rem 0.75rem', color:'var(--text-muted)', fontSize:'0.875rem' }}>
                  👥 {p.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ));

  if (loading) return <LoadingSpinner />;

  const parentOptions = getParentOptions();

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>🏛️ Manage Hierarchy</h1>
        <p>Division → School → Department → Panel</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Add node form */}
        <div className="card">
          <div className="card-header"><h3>➕ Add Node</h3></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-control"
                  value={form.type}
                  onChange={(e) => setForm({ type: e.target.value, name: '', parent_id: '' })}
                >
                  <option value="division">Division</option>
                  <option value="school">School</option>
                  <option value="department">Department</option>
                  <option value="panel">Panel</option>
                </select>
              </div>

              {parentOptions.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Parent {form.type === 'school' ? 'Division' : form.type === 'department' ? 'School' : 'Department'}</label>
                  <select
                    className="form-control"
                    value={form.parent_id}
                    onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                    required
                  >
                    <option value="">-- Select --</option>
                    {parentOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  placeholder={`${form.type} name…`}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving} style={{ width:'100%' }}>
                {saving ? 'Saving…' : '✅ Create'}
              </button>
            </form>
          </div>
        </div>

        {/* Tree view */}
        <div className="card">
          <div className="card-header"><h3>📊 Current Hierarchy</h3></div>
          <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {hierarchy.length === 0
              ? <div className="empty-state"><div className="empty-icon">🏛️</div><h3>No hierarchy yet</h3></div>
              : renderTree(hierarchy)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHierarchy;
