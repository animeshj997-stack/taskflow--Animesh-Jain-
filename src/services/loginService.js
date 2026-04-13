const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logger = require('../utils/logger');
const userRepository = require('../repositories/userRepository');
const handleResponse = require('../utils/handleResponse');
const { ValidationError, ConflictError } = require('../utils/errorHandler');

const BCRYPT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

async function register(name, email, password) {
  const logPrefix = '[LoginService] [register]';
  logger.info(`${logPrefix} Attempting to register user with email: ${email}`);

  if (!name || !email || !password) {
    logger.warn(`${logPrefix} Missing required fields for registration`);
    throw new ValidationError('Name, email, and password are required');
  }

  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    logger.warn(`${logPrefix} Email already registered: ${email}`);
    throw new ConflictError(`Email already registered: ${email}`);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await userRepository.createUser(name, email, passwordHash);
  
  const token = jwt.sign(
    { user_id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  logger.info(`${logPrefix} User registered successfully: ${user.id}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.CREATED,
    'User registered successfully',
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    }
  );
}

async function login(email, password) {
  const logPrefix = '[LoginService] [login]';
  logger.info(`${logPrefix} Attempting to login user with email: ${email}`);

  if (!email || !password) {
    logger.warn(`${logPrefix} Missing email or password`);
    throw new ValidationError('Email and password are required');
  }

  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    logger.warn(`${logPrefix} User not found: ${email}`);
    throw new ValidationError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    logger.warn(`${logPrefix} Invalid password for user: ${email}`);
    throw new ValidationError('Invalid email or password');
  }

  const token = jwt.sign(
    { user_id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  logger.info(`${logPrefix} User logged in successfully: ${user.id}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.OK,
    'Login successful',
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    }
  );
}

function verifyToken(token) {
  const logPrefix = '[LoginService] [verifyToken]';

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.warn(`${logPrefix} Token verification failed: ${error.message}`);
    throw new ValidationError('Invalid or expired token');
  }
}

module.exports = {
  register,
  login,
  verifyToken
};
