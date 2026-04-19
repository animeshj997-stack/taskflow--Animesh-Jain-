-- Insert test user (password: password123)
-- Hash: $2b$12$R9h7cIPz0gi.URNNGHQ1be3DlH.PKZbv5H8KnzzVgXXbVxzy6jKm
INSERT INTO users (id, name, email, password_hash, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Test User', 'test@example.com', '$2b$12$R9h7cIPz0gi.URNNGHQ1be3DlH.PKZbv5H8KnzzVgXXbVxzy6jKm', NOW());

-- Insert test project
INSERT INTO projects (id, name, description, owner_id, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sample Project', 'This is a sample project', '550e8400-e29b-41d4-a716-446655440000', NOW());

-- Insert test tasks
INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Todo Task', 'A task in todo status', 'todo', 'high', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '2026-04-20', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'In Progress Task', 'A task in progress', 'in_progress', 'medium', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '2026-04-15', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Done Task', 'A completed task', 'done', 'low', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '2026-04-10', NOW(), NOW());
