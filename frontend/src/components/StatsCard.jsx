const ICON_COLORS = {
  indigo: { bg: 'rgba(99,102,241,0.15)', color: '#818CF8' },
  cyan:   { bg: 'rgba(34,211,238,0.12)', color: '#22D3EE' },
  green:  { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
  amber:  { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  red:    { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
};

const StatsCard = ({ icon, value, label, color = 'indigo', trend }) => {
  const c = ICON_COLORS[color] || ICON_COLORS.indigo;
  return (
    <div className="stat-card fade-in">
      <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
        {icon}
      </div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {trend !== undefined && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
        </div>
      )}
    </div>
  );
};

export default StatsCard;
