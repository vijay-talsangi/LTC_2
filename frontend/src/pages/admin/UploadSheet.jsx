import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { uploadFacultySheet, uploadStudentSheet } from '../../api/admin.api';

const UploadZone = ({ type, onSuccess }) => {
  const inputRef     = useRef();
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const label  = type === 'faculty' ? 'Faculty' : 'Student';
  const icon   = type === 'faculty' ? '👨‍🏫' : '🎓';
  const color  = type === 'faculty' ? 'var(--primary)' : 'var(--secondary)';

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      toast.error('Please select an Excel or CSV file');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    setLoading(true);
    try {
      const fn = type === 'faculty' ? uploadFacultySheet : uploadStudentSheet;
      const res = await fn(file);
      setResult(res.data.data);
      toast.success(res.data.message || 'Upload complete!');
      setFile(null);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header">
        <h3>{icon} Upload {label} Sheet</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          .xlsx / .xls / .csv
        </span>
      </div>
      <div className="card-body">
        {/* Expected columns hint */}
        <div style={{
          padding: '0.75rem 1rem', background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)', marginBottom: '1rem',
          fontSize: '0.78rem', color: 'var(--text-muted)', border: '1px solid var(--border)',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Expected columns: </strong>
          {type === 'faculty'
            ? 'Faculty ID | Faculty Name | Email | DOB | Phone | Division | School | Department | Panel Assigned | Role'
            : 'Name | Email | DOB | Division | School | Department | Panel'}
        </div>

        {/* Drag-drop zone */}
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="upload-icon">{file ? '📄' : '📁'}</div>
          {file ? (
            <>
              <h3 style={{ color }}>{file.name}</h3>
              <p>{(file.size / 1024).toFixed(1)} KB — Ready to upload</p>
            </>
          ) : (
            <>
              <h3>Drag & drop your {label} sheet here</h3>
              <p>or click to browse files</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          {file && (
            <button className="btn btn-secondary" onClick={() => { setFile(null); setResult(null); }}>
              Clear
            </button>
          )}
          <button
            id={`upload-${type}-btn`}
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading…</>
            ) : (
              `⬆️ Upload ${label} Sheet`
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{ marginTop: '1.25rem' }} className="fade-in">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Inserted', value: result.inserted, color: 'var(--success)' },
                { label: 'Skipped',  value: result.skipped,  color: 'var(--warning)' },
                { label: 'Failed',   value: result.failed?.length, color: 'var(--danger)' },
              ].map((s) => (
                <div key={s.label} style={{
                  padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value ?? 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {result.failed?.length > 0 && (
              <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
                <strong>Failed rows:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem', fontSize: '0.8rem' }}>
                  {result.failed.map((f, i) => <li key={i}>{f.email}: {f.error}</li>)}
                </ul>
              </div>
            )}
            {result.parseErrors?.length > 0 && (
              <div className="alert alert-warning" style={{ marginTop: '0.75rem' }}>
                <strong>Parse warnings ({result.parseErrors.length}):</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem', fontSize: '0.8rem' }}>
                  {result.parseErrors.slice(0, 5).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.error}</li>
                  ))}
                  {result.parseErrors.length > 5 && <li>…and {result.parseErrors.length - 5} more</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const UploadSheet = () => (
  <div className="page-wrapper fade-in">
    <div className="page-header">
      <h1>📤 Upload Sheets</h1>
      <p>Upload Excel sheets to auto-create Faculty & Student accounts with DOB-based credentials</p>
    </div>
    <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
      🔐 Default password for all users = DOB in <strong>DDMMYYYY</strong> format
      &nbsp;(e.g. 01/01/2000 → <code>01012000</code>)
    </div>
    <UploadZone type="faculty" />
    <UploadZone type="student" />
  </div>
);

export default UploadSheet;
