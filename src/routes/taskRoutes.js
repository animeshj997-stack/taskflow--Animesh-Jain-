const express = require('express');
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: APIs for managing tasks within projects
 */

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID (UUID)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *         required: false
 *         description: Filter tasks by status
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter tasks by assignee ID (UUID)
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     summary: Create a new task in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Implement authentication"
 *               description:
 *                 type: string
 *                 description: Task description (optional)
 *                 example: "Add JWT-based authentication"
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 description: Task status (optional, defaults to 'todo')
 *                 example: "todo"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority (optional, defaults to 'medium')
 *                 example: "high"
 *               assignee_id:
 *                 type: string
 *                 description: Assignee user ID (UUID, optional)
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: Due date (optional)
 *                 example: "2026-04-30"
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               assignee_id:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task (project owner only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID (UUID)
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden - Not project owner
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.use(auth);

// Standalone task update/delete routes
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
