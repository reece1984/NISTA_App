/**
 * Simple Logger Utility
 * Can be replaced with Winston or Pino later
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (message, ...args) => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${colors.dim}${timestamp()}${colors.reset} ${message}`, ...args);
  },

  success: (message, ...args) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${colors.dim}${timestamp()}${colors.reset} ${message}`, ...args);
  },

  warn: (message, ...args) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${colors.dim}${timestamp()}${colors.reset} ${message}`, ...args);
  },

  error: (message, ...args) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${colors.dim}${timestamp()}${colors.reset} ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.magenta}[DEBUG]${colors.reset} ${colors.dim}${timestamp()}${colors.reset} ${message}`, ...args);
    }
  },

  http: (req, res, duration) => {
    const statusColor = res.statusCode >= 400 ? colors.red : colors.green;
    console.log(
      `${colors.blue}[HTTP]${colors.reset} ` +
      `${req.method} ${req.path} ` +
      `${statusColor}${res.statusCode}${colors.reset} ` +
      `${colors.dim}${duration}ms${colors.reset}`
    );
  }
};

/**
 * Express HTTP logger middleware
 */
export function httpLogger(req, res, next) {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });

  next();
}
