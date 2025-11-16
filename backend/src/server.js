/**
 * Gateway Success Express API Server
 * Main entry point for the backend API
 * Handles all CRUD operations for action plan management
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { httpLogger, logger } from './utils/logger.js';

// Import routes
import healthRouter from './routes/health.js';
import actionsRouter from './routes/actions.js';
import commentsRouter from './routes/comments.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS - Allow frontend to call API
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5184'];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(httpLogger);

// =====================================================
// ROUTES
// =====================================================

// Health check
app.use('/api', healthRouter);

// Actions routes
app.use('/api', actionsRouter);

// Comments routes
app.use('/api', commentsRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Gateway Success API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      actions: {
        list: 'GET /api/projects/:projectId/actions',
        get: 'GET /api/actions/:id',
        update: 'PATCH /api/actions/:id',
        bulkUpdate: 'PATCH /api/actions/bulk',
        history: 'GET /api/actions/:id/history',
        confirm: 'POST /api/actions/confirm'
      },
      comments: {
        list: 'GET /api/actions/:actionId/comments',
        create: 'POST /api/actions/:actionId/comments',
        update: 'PATCH /api/comments/:id',
        delete: 'DELETE /api/comments/:id'
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =====================================================
// START SERVER
// =====================================================

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log('');
    logger.success(`🚀 Gateway Success API Server started`);
    logger.info(`📍 Running on: http://localhost:${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 CORS enabled for: ${corsOptions.origin}`);
    console.log('');
    logger.info('Available endpoints:');
    logger.info(`  GET  ${PORT}/api/health`);
    logger.info(`  GET  /api/projects/:projectId/actions`);
    logger.info(`  GET  /api/actions/:id`);
    logger.info(`  PATCH /api/actions/:id`);
    logger.info(`  PATCH /api/actions/bulk`);
    logger.info(`  POST /api/actions/confirm`);
    logger.info(`  GET  /api/actions/:id/history`);
    logger.info(`  GET  /api/actions/:actionId/comments`);
    logger.info(`  POST /api/actions/:actionId/comments`);
    console.log('');
    logger.info('Press Ctrl+C to stop');
    console.log('');
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;

