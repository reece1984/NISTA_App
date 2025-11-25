/**
 * Request Validation Middleware
 * Using express-validator for input validation
 */

import { validationResult } from 'express-validator';

/**
 * Check validation results and return errors if any
 */
export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Debug logging
    console.log('Validation failed for request:', req.method, req.path);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Validation errors:', errors.array());

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
}
