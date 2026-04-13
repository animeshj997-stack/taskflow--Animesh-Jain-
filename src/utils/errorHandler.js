class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', details = null) {
    super(404, message, details);
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details = null) {
    super(400, message, details);
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', details = null) {
    super(409, message, details);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details = null) {
    super(401, message, details);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details = null) {
    super(403, message, details);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('[Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    });
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.constructor.name.replace(/Error$/, '').toUpperCase() + '_ERROR',
        message: err.message,
        details: err.details,
      },
    });
  }

  // Handle unexpected errors
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
  asyncHandler
};
