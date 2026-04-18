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
  if (typeof dob === 'number') return excelSerialToDate(dob);
  const d = new Date(dob);
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
