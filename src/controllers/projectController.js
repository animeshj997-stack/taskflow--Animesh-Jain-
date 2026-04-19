const { z } = require('zod');
const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger');
const projectService = require('../services/projectService');
const taskService = require('../services/taskService');
const handleResponse = require('../utils/handleResponse');
const { validateRequest } = require('../utils/validationHelper');
const { asyncHandler } = require('../utils/errorHandler');

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional()
});

const projectController = {
  listProjects: asyncHandler(async (req, res) => {
    logger.info('[projectController] [listProjects] Fetching projects for user');
    const result = await projectService.getProjectsByUser(req.user.user_id);
    return res.status(result.statusCode).json(result);
  }),

  createProject: asyncHandler(async (req, res) => {
    logger.info('[projectController] [createProject] Creating new project');
    const validated = validateRequest(createProjectSchema, req.body);
    const result = await projectService.createProject(
      validated.name,
      validated.description || null,
      req.user.user_id
    );
    return res.status(result.statusCode).json(result);
  }),

  getProject: asyncHandler(async (req, res) => {
    logger.info('[projectController] [getProject] Fetching project details');
    const project = await projectService.getProjectById(req.params.id, req.user.user_id);
    const tasksResult = await taskService.getTasksByProject(req.params.id);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Project retrieved successfully',
      data: {
        ...project,
        tasks: tasksResult.data.tasks
      }
    });
  }),

  updateProject: asyncHandler(async (req, res) => {
    logger.info('[projectController] [updateProject] Updating project');
    const validated = validateRequest(updateProjectSchema, req.body);
    const result = await projectService.updateProject(
      req.params.id,
      validated,
      req.user.user_id
    );
    return res.status(result.statusCode).json(result);
  }),

  deleteProject: asyncHandler(async (req, res) => {
    logger.info('[projectController] [deleteProject] Deleting project');
    const result = await projectService.deleteProject(req.params.id, req.user.user_id);
    return res.status(result.statusCode).json(result);
  })
};

module.exports = projectController;
