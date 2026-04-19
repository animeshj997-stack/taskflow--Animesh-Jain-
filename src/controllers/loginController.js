const { z } = require('zod');
const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger');
const loginService = require('../services/loginService');
const handleResponse = require('../utils/handleResponse');
const { validateRequest } = require('../utils/validationHelper');
const { asyncHandler } = require('../utils/errorHandler');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const loginController = {
  register: asyncHandler(async (req, res) => {
    logger.info('[loginController] [register] New registration attempt');
    const validated = validateRequest(registerSchema, req.body);
    const result = await loginService.register(validated.name, validated.email, validated.password);
    return res.status(result.statusCode).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    logger.info('[loginController] [login] New login attempt');
    const validated = validateRequest(loginSchema, req.body);
    const result = await loginService.login(validated.email, validated.password);
    return res.status(result.statusCode).json(result);
  })
};

module.exports = loginController;
