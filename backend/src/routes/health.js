/**
 * Health Check Route
 * Simple endpoint to verify API is running
 * Uses Supabase REST API (works with Vercel serverless)
 */

import express from 'express';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', asyncHandler(async (req, res) => {
  // Check database connection
  const dbStart = Date.now();

  try {
    const { error } = await supabase
      .from('actions')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    const dbDuration = Date.now() - dbStart;

    if (error) {
      return res.status(500).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'error',
          error: error.message,
          response_time_ms: dbDuration
        },
        api: {
          version: '1.0.0',
          uptime_seconds: Math.floor(process.uptime())
        }
      });
    }

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        response_time_ms: dbDuration,
        connection_type: 'supabase_rest_api'
      },
      api: {
        version: '1.0.0',
        uptime_seconds: Math.floor(process.uptime())
      }
    });
  } catch (error) {
    const dbDuration = Date.now() - dbStart;

    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'error',
        error: error.message,
        response_time_ms: dbDuration
      },
      api: {
        version: '1.0.0',
        uptime_seconds: Math.floor(process.uptime())
      }
    });
  }
}));

export default router;
