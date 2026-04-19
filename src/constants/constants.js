const TaskStatus = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done'
});

const TaskPriority = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
});

const ErrorCodes = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
});

const HttpStatusCodes = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
});

module.exports = {
  TaskStatus,
  TaskPriority,
  ErrorCodes,
  HttpStatusCodes
};
