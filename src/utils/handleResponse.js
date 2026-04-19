const formatSuccessResponse = (statusCode, message, data = null) => {
  return {
    success: true,
    statusCode,
    message,
    data
  };
};

const formatErrorResponse = (statusCode, message, errors = null) => {
  return {
    success: false,
    statusCode,
    message,
    errors
  };
};

module.exports = {
  formatSuccessResponse,
  formatErrorResponse
};
