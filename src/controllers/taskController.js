const { z } = require('zod');
const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger');
const taskService = require('../services/taskService');
const handleResponse = require('../utils/handleResponse');
const { validateRequest } = require('../utils/validationHelper');
const { asyncHandler } = require('../utils/errorHandler');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z.string().uuid('Invalid assignee ID').optional(),
  due_date: z.string().date().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z.string().uuid('Invalid assignee ID').optional(),
  due_date: z.string().date().optional()
});

const taskController = {
  listTasks: asyncHandler(async (req, res) => {
    logger.info('[taskController] [listTasks] Fetching tasks for project');
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.assignee) {
      filters.assignee = req.query.assignee;
    }
    const result = await taskService.getTasksByProject(req.params.id, filters);
    return res.status(result.statusCode).json(result);
  }),

  createTask: asyncHandler(async (req, res) => {
    logger.info('[taskController] [createTask] Creating new task');
    const validated = validateRequest(createTaskSchema, req.body);
    const result = await taskService.createTask(
      validated.title,
      validated.description || null,
      validated.status || 'todo',
      validated.priority || 'medium',
      req.params.id,
      validated.assignee_id || null,
      validated.due_date || null
    );
    return res.status(result.statusCode).json(result);
  }),

  updateTask: asyncHandler(async (req, res) => {
    logger.info('[taskController] [updateTask] Updating task');
    const validated = validateRequest(updateTaskSchema, req.body);
    const updates = {
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      assigneeId: validated.assignee_id,
      dueDate: validated.due_date
    };
    const result = await taskService.updateTask(req.params.id, updates, req.user.user_id);
    return res.status(result.statusCode).json(result);
  }),

  deleteTask: asyncHandler(async (req, res) => {
    logger.info('[taskController] [deleteTask] Deleting task');
    const result = await taskService.deleteTask(req.params.id, req.user.user_id);
    return res.status(result.statusCode).json(result);
  })
};

module.exports = taskController;
