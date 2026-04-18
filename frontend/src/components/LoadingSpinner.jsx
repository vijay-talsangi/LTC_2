const LoadingSpinner = ({ text = 'Loading…' }) => (
  <div className="spinner-wrap" style={{ flexDirection: 'column', gap: '1rem' }}>
    <div className="spinner" />
    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</span>
  </div>
);

export default LoadingSpinner;
