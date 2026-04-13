const express = require('express');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: APIs for managing projects
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects for authenticated user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *                 example: "Q1 Development"
 *               description:
 *                 type: string
 *                 description: Project description (optional)
 *                 example: "Development project for Q1 2026"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project details with tasks
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID (UUID)
 *     responses:
 *       200:
 *         description: Project details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Update project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *                 example: "Updated Project Name"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Forbidden - Not project owner
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID (UUID)
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Forbidden - Not project owner
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.use(auth);

router.get('/', projectController.listProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

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
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/:id/tasks', taskController.listTasks);

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
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.post('/:id/tasks', taskController.createTask);

module.exports = router;
