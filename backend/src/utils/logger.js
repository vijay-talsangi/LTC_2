const COLORS = {
  reset:  '\x1b[0m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};

const ts = () =>
  new Date().toISOString().replace('T', ' ').split('.')[0];

export const logger = {
  info:    (msg, ...a) => console.log (`${COLORS.cyan  }[${ts()}] INFO   ${COLORS.reset}`, msg, ...a),
  error:   (msg, ...a) => console.error(`${COLORS.red   }[${ts()}] ERROR  ${COLORS.reset}`, msg, ...a),
  warn:    (msg, ...a) => console.warn (`${COLORS.yellow}[${ts()}] WARN   ${COLORS.reset}`, msg, ...a),
  success: (msg, ...a) => console.log (`${COLORS.green }[${ts()}] SUCCESS${COLORS.reset}`, msg, ...a),
  debug:   (msg, ...a) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${COLORS.gray}[${ts()}] DEBUG  ${COLORS.reset}`, msg, ...a);
    }
  },
};
