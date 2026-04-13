require('dotenv/config');

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const logger = require('./utils/logger');
const pool = require('./db/pool');
const runMigrations = require('../migrations');
const { errorHandler } = require('./utils/errorHandler');
const loginRoutes = require('./routes/loginRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const swaggerSpecs = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customSiteTitle: 'TaskFlow API Documentation',
}));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', loginRoutes);
app.use('/projects', projectRoutes);
// Task routes for update/delete standalone operations
app.use('/tasks', taskRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

let server;

async function start() {
  try {
    logger.info('Running database migrations...');
    await runMigrations();
    logger.info('Migrations completed');

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      try {
        await pool.end();
        logger.info('Database pool closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing database pool:', error);
        process.exit(1);
      }
    });
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
