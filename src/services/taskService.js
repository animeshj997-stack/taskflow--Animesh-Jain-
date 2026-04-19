const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger');
const taskRepository = require('../repositories/taskRepository');
const projectRepository = require('../repositories/projectRepository');
const handleResponse = require('../utils/handleResponse');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errorHandler');
const constants = require('../constants/constants');

async function createTask(title, description, status, priority, projectId, assigneeId, dueDate) {
  const logPrefix = '[TaskService] [createTask]';
  logger.info(`${logPrefix} Creating task: ${title} in project: ${projectId}`);

  if (!title || !projectId) {
    logger.warn(`${logPrefix} Missing required fields`);
    throw new ValidationError('Task title and project ID are required');
  }

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${projectId}`);
    throw new NotFoundError(`Project not found: ${projectId}`);
  }

  const task = await taskRepository.createTask(
    title,
    description,
    status || constants.TaskStatus.TODO,
    priority || constants.TaskPriority.MEDIUM,
    projectId,
    assigneeId,
    dueDate
  );

  logger.info(`${logPrefix} Task created successfully: ${task.id}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.CREATED,
    'Task created successfully',
    task
  );
}

async function getTasksByProject(projectId, filters = {}) {
  const logPrefix = '[TaskService] [getTasksByProject]';
  logger.info(`${logPrefix} Fetching tasks for project: ${projectId} with filters: ${JSON.stringify(filters)}`);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${projectId}`);
    throw new NotFoundError(`Project not found: ${projectId}`);
  }

  const tasks = await taskRepository.getTasksByProjectId(projectId, filters);
  logger.info(`${logPrefix} Retrieved ${tasks.length} tasks for project: ${projectId}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.OK,
    'Tasks retrieved successfully',
    { tasks }
  );
}

async function getTaskById(taskId) {
  const logPrefix = '[TaskService] [getTaskById]';
  logger.info(`${logPrefix} Fetching task: ${taskId}`);

  const task = await taskRepository.getTaskById(taskId);
  if (!task) {
    logger.warn(`${logPrefix} Task not found: ${taskId}`);
    throw new NotFoundError(`Task not found: ${taskId}`);
  }

  logger.info(`${logPrefix} Task retrieved: ${taskId}`);
  return task;
}

async function updateTask(taskId, updates, userId) {
  const logPrefix = '[TaskService] [updateTask]';
  logger.info(`${logPrefix} Updating task: ${taskId} by user: ${userId}`);

  const task = await taskRepository.getTaskById(taskId);
  if (!task) {
    logger.warn(`${logPrefix} Task not found: ${taskId}`);
    throw new NotFoundError(`Task not found: ${taskId}`);
  }

  const project = await projectRepository.getProjectById(task.project_id);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${task.project_id}`);
    throw new NotFoundError(`Project not found: ${task.project_id}`);
  }

  const updatedTask = await taskRepository.updateTask(taskId, updates);
  logger.info(`${logPrefix} Task updated successfully: ${taskId}`);

  return handleResponse.formatSuccessResponse(
    StatusCodes.OK,
    'Task updated successfully',
    updatedTask
  );
}

async function deleteTask(taskId, userId) {
  const logPrefix = '[TaskService] [deleteTask]';
  logger.info(`${logPrefix} Deleting task: ${taskId} by user: ${userId}`);

  const task = await taskRepository.getTaskById(taskId);
  if (!task) {
    logger.warn(`${logPrefix} Task not found: ${taskId}`);
    throw new NotFoundError(`Task not found: ${taskId}`);
  }

  const project = await projectRepository.getProjectById(task.project_id);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${task.project_id}`);
    throw new NotFoundError(`Project not found: ${task.project_id}`);
  }

  if (project.owner_id !== userId) {
    logger.warn(`${logPrefix} User ${userId} is not owner of project ${task.project_id}`);
    throw new ForbiddenError('You do not have permission to delete this task');
  }

  await taskRepository.deleteTask(taskId);
  logger.info(`${logPrefix} Task deleted successfully: ${taskId}`);

  return handleResponse.formatSuccessResponse(StatusCodes.OK, 'Task deleted successfully');
}

async function canEditTask(taskId, userId) {
  const logPrefix = '[TaskService] [canEditTask]';
  logger.info(`${logPrefix} Checking if user ${userId} can edit task: ${taskId}`);

  const task = await taskRepository.getTaskById(taskId);
  if (!task) {
    logger.warn(`${logPrefix} Task not found: ${taskId}`);
    return false;
  }
  
  const project = await projectRepository.getProjectById(task.project_id);
  if (!project) {
    logger.warn(`${logPrefix} Project not found: ${task.project_id}`);
    return false;
  }

  return true;
}

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  canEditTask
};
