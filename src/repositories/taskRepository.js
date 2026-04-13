const pool = require('../db/pool');

async function createTask(title, description, status, priority, projectId, assigneeId, dueDate) {
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at`,
    [title, description, status, priority, projectId, assigneeId, dueDate]
  );
  return result.rows[0];
}

async function getTaskById(id) {
  const result = await pool.query(
    `SELECT id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at
     FROM tasks WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getTasksByProjectId(projectId, filters = {}) {
  let query = `SELECT id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at
               FROM tasks WHERE project_id = $1`;
  const params = [projectId];
  let paramCount = 2;

  if (filters.status) {
    query += ` AND status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  if (filters.assignee) {
    query += ` AND assignee_id = $${paramCount}`;
    params.push(filters.assignee);
    paramCount++;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

async function updateTask(id, updates) {
  const { title, description, status, priority, assigneeId, dueDate } = updates;
  
  const result = await pool.query(
    `UPDATE tasks 
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         priority = COALESCE($4, priority),
         assignee_id = CASE WHEN $5::uuid IS NOT NULL THEN $5 ELSE assignee_id END,
         due_date = CASE WHEN $6::date IS NOT NULL THEN $6 ELSE due_date END,
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at`,
    [title, description, status, priority, assigneeId || null, dueDate || null, id]
  );
  return result.rows[0] || null;
}

async function deleteTask(id) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

async function getTaskCreator(taskId) {
  const result = await pool.query(
    `SELECT project_id FROM tasks WHERE id = $1`,
    [taskId]
  );
  return result.rows[0] || null;
}

async function getTaskDetails(taskId) {
  const result = await pool.query(
    `SELECT id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at
     FROM tasks WHERE id = $1`,
    [taskId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createTask,
  getTaskById,
  getTasksByProjectId,
  updateTask,
  deleteTask,
  getTaskCreator,
  getTaskDetails
};
