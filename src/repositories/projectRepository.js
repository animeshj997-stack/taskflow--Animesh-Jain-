const pool = require('../db/pool');

async function createProject(name, description, ownerId) {
  const result = await pool.query(
    'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id, name, description, owner_id, created_at',
    [name, description, ownerId]
  );
  return result.rows[0];
}

async function getProjectById(id) {
  const result = await pool.query(
    'SELECT id, name, description, owner_id, created_at FROM projects WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function getProjectsByUserId(userId) {
  const result = await pool.query(
    `SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at
     FROM projects p
     LEFT JOIN tasks t ON p.id = t.project_id
     WHERE p.owner_id = $1 OR t.assignee_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function updateProject(id, name, description) {
  const result = await pool.query(
    'UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, owner_id, created_at',
    [name, description, id]
  );
  return result.rows[0] || null;
}

async function deleteProject(id) {
  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

async function getProjectOwner(projectId) {
  const result = await pool.query(
    'SELECT owner_id FROM projects WHERE id = $1',
    [projectId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createProject,
  getProjectById,
  getProjectsByUserId,
  updateProject,
  deleteProject,
  getProjectOwner
};
