const { StatusCodes } = require('http-status-codes');
const { ValidationError } = require('./errorHandler');

/**
 * Validates request data using Zod schema
 * Throws ValidationError with formatted details on validation failure
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {any} Validated data
 */
function validateRequest(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error.name === 'ZodError') {
      const details = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));

      throw new ValidationError(
        'Validation failed',
        details
      );
    }
    throw error;
  }
}

module.exports = {
  validateRequest,
};
