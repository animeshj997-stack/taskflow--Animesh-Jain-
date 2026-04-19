const jwt = require('jsonwebtoken');

const logger = require('../utils/logger');
const { UnauthorizedError } = require('../utils/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const auth = (req, res, next) => {
  const logPrefix = '[Auth Middleware]';
  logger.info(`${logPrefix} Verifying token for ${req.method} ${req.path}`);

  // Log all headers for debugging
  logger.info(`${logPrefix} Headers received:`, Object.keys(req.headers));
  
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  logger.info(`${logPrefix} Authorization header value: ${authHeader ? 'present' : 'missing'}`);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`${logPrefix} Missing or invalid authorization header for ${req.path}`);
    logger.warn(`${logPrefix} Auth header received: ${authHeader}`);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED_ERROR',
        message: 'Missing or invalid token'
      }
    });
  }

  const token = authHeader.slice(7);
  logger.info(`${logPrefix} Token extracted (length: ${token.length})`);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email
    };
    logger.info(`${logPrefix} Token verified successfully for user: ${decoded.user_id}`);
    next();
  } catch (error) {
    logger.warn(`${logPrefix} Token verification failed: ${error.message}`);
    logger.warn(`${logPrefix} JWT_SECRET check: ${JWT_SECRET ? 'set' : 'not set'}`);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED_ERROR',
        message: 'Invalid or expired token'
      }
    });
  }
};

module.exports = { auth };
