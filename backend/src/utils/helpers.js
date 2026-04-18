// ─── Date / DOB Utilities ───────────────────────────────────

/**
 * Convert an Excel serial date number to a JS Date.
 * Excel erroneously treats 1900 as a leap year so we subtract 2 days.
 */
export const excelSerialToDate = (serial) => {
  const excelEpoch = new Date(1900, 0, 1);
  const date = new Date(excelEpoch.getTime() + (serial - 2) * 86_400_000);
  return date;
};

/**
 * Normalise any DOB value (JS Date, Excel serial, or string) to a JS Date.
 */
const parseDOB = (dob) => {
  if (!dob) return null;
  if (dob instanceof Date) return isNaN(dob) ? null : dob;
  if (typeof dob === 'number') {
    // Handle both Excel serial values and YYYYMMDD-like numeric input.
    if (dob > 10_000_000) {
      const str = String(Math.trunc(dob));
      const yyyy = Number(str.slice(0, 4));
      const mm = Number(str.slice(4, 6));
      const dd = Number(str.slice(6, 8));
      const d = new Date(yyyy, mm - 1, dd);
      return isNaN(d) ? null : d;
    }
    return excelSerialToDate(dob);
  }

  const raw = String(dob).trim();
  if (!raw) return null;

  // Prefer deterministic day-first parsing for separator-based DOB strings.
  const dmyMatch = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (dmyMatch) {
    const dd = Number(dmyMatch[1]);
    const mm = Number(dmyMatch[2]);
    const yy = Number(dmyMatch[3]);
    const yyyy = yy < 100 ? 2000 + yy : yy;
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? null : d;
  }

  // Support compact DOB values like DDMMYYYY.
  const compact = raw.replace(/\D/g, '');
  if (compact.length === 8) {
    const dd = Number(compact.slice(0, 2));
    const mm = Number(compact.slice(2, 4));
    const yyyy = Number(compact.slice(4, 8));
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? null : d;
  }

  const d = new Date(raw);
  return isNaN(d) ? null : d;
};

/**
 * Format DOB as DDMMYYYY – used as default password.
 */
export const formatDOBPassword = (dob) => {
  const date = parseDOB(dob);
  if (!date) return null;
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
};

/**
 * Convert any DOB value to YYYY-MM-DD ISO string for Postgres.
 */
export const toISODate = (dob) => {
  const date = parseDOB(dob);
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

// ─── String Utilities ───────────────────────────────────────

/** Trim a value and return null if empty */
export const sanitize = (val) => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str === '' ? null : str;
};

// ─── Pagination ─────────────────────────────────────────────

export const paginate = (page = 1, limit = 20, total = 0) => ({
  offset: (page - 1) * limit,
  limit:  parseInt(limit),
  page:   parseInt(page),
  total,
  pages:  Math.ceil(total / limit),
});
