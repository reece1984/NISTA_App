/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          error: 'Duplicate entry',
          message: err.detail || 'Resource already exists'
        });

      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          error: 'Invalid reference',
          message: 'Referenced resource does not exist'
        });

      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          error: 'Missing required field',
          message: err.column ? `${err.column} is required` : 'Required field is missing'
        });

      default:
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
  }

  // Validation errors (from express-validator)
  if (err.array) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: err.array()
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
