const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger');
const projectRepository = require('../repositories/projectRepository');
const handleResponse = require('../utils/handleResponse');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errorHandler');

async function createProject(name, description, ownerId) {
  const logPrefix = '[ProjectService] [createProject]';
  logger.info(`${logPrefix} Creating project: ${name} for owner: ${ownerId}`);

  if (!name || !ownerId) {
    logger.warn(`${logPrefix} Missing required fields`);
    throw new ValidationError('Project name and owner are required');
  }

  const project = await projectRepository.createProject(name, description, ownerId);
  logger.info(`${logPrefix} Project created successfully: ${project.id}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.CREATED,
    'Project created successfully',
    project
  );
}

async function getProjectById(projectId, userId) {
  const logPrefix = '[ProjectService] [getProjectById]';
  logger.info(`${logPrefix} Fetching project: ${projectId} for user: ${userId}`);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${projectId}`);
    throw new NotFoundError(`Project not found: ${projectId}`);
  }

  logger.info(`${logPrefix} Project retrieved: ${projectId}`);
  return project;
}

async function getProjectsByUser(userId) {
  const logPrefix = '[ProjectService] [getProjectsByUser]';
  logger.info(`${logPrefix} Fetching projects for user: ${userId}`);

  const projects = await projectRepository.getProjectsByUserId(userId);
  logger.info(`${logPrefix} Retrieved ${projects.length} projects for user: ${userId}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.OK,
    'Projects retrieved successfully',
    { projects }
  );
}

async function updateProject(projectId, updates, userId) {
  const logPrefix = '[ProjectService] [updateProject]';
  logger.info(`${logPrefix} Updating project: ${projectId} by user: ${userId}`);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${projectId}`);
    throw new NotFoundError(`Project not found: ${projectId}`);
  }

  if (project.owner_id !== userId) {
    logger.warn(`${logPrefix} User ${userId} is not owner of project ${projectId}`);
    throw new ForbiddenError('You do not have permission to update this project');
  }

  const updatedProject = await projectRepository.updateProject(
    projectId,
    updates.name || project.name,
    updates.description !== undefined ? updates.description : project.description
  );

  logger.info(`${logPrefix} Project updated successfully: ${projectId}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.OK,
    'Project updated successfully',
    updatedProject
  );
}

async function deleteProject(projectId, userId) {
  const logPrefix = '[ProjectService] [deleteProject]';
  logger.info(`${logPrefix} Deleting project: ${projectId} by user: ${userId}`);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${projectId}`);
    throw new NotFoundError(`Project not found: ${projectId}`);
  }

  if (project.owner_id !== userId) {
    logger.warn(`${logPrefix} User ${userId} is not owner of project ${projectId}`);
    throw new ForbiddenError('You do not have permission to delete this project');
  }

  await projectRepository.deleteProject(projectId);
  logger.info(`${logPrefix} Project deleted successfully: ${projectId}`);

  return handleResponse.formatSuccessResponse(StatusCodes.OK, 'Project deleted successfully');
}

async function checkProjectOwner(projectId, userId) {
  const logPrefix = '[ProjectService] [checkProjectOwner]';
  logger.info(`${logPrefix} Checking if user ${userId} is owner of project ${projectId}`);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${projectId}`);
    throw new NotFoundError(`Project not found: ${projectId}`);
  }

  return project.owner_id === userId;
}

module.exports = {
  createProject,
  getProjectById,
  getProjectsByUser,
  updateProject,
  deleteProject,
  checkProjectOwner
};
