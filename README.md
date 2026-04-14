# TaskFlow — Task Management REST API

A minimal but complete task management system with user authentication, projects, and task assignment. Built with Node.js, Express, PostgreSQL, and Docker.

**Live Demo**: http://13.233.92.74:3000/api-docs

---

## Overview

TaskFlow is a REST API-based task management system for the engineering take-home assignment. Users can:
- Register and log in securely with JWT authentication
- Create projects and invite collaborators
- Create, assign, and track tasks within projects
- Filter tasks by status and assignee
- Update task progress with status tracking (todo, in_progress, done)

**Tech Stack:**
- **Backend**: Node.js + Express.js (JavaScript)
- **Database**: PostgreSQL with migration-based schema management
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Documentation**: Swagger/OpenAPI via swagger-jsdoc
- **Process Management**: PM2 for production deployments
- **Containerization**: Docker & Docker Compose

---

## Architecture Decisions

### 1. **Layered Architecture**
The codebase follows a clean layered pattern:
```
routes/ → controllers/ → services/ → repositories/ → db/
```
- **Routes**: HTTP endpoint definitions
- **Controllers**: Request validation and response formatting
- **Services**: Business logic and data orchestration
- **Repositories**: Database query isolation
- **DB**: Connection pooling and migrations

**Why**: Clear separation of concerns makes testing, debugging, and maintenance easier. Each layer has a single responsibility.

### 2. **Migration-Based Schema Management**
Using raw SQL migration files (`001_create_users.sql`, etc.) instead of an ORM:
- Full control over schema
- Explicit version control of database changes
- Easy rollback with down migrations
- Migrations run automatically on container startup

**Why**: For a mid-level assessment, explicit migrations demonstrate understanding of relational databases and deployment pipelines.

### 3. **JWT for Authentication**
- Claims: `user_id`, `email`, `iat` (issued at), `exp` (expiry at 24 hours)
- Authorization middleware validates token on protected routes
- Token stored client-side (assumed frontend integration)

**Why**: Stateless, scalable, and industry-standard for REST APIs.

### 4. **Error Handling & Validation**
- Structured error responses with HTTP status codes
- Zod for schema validation on request bodies
- Winston for structured logging
- Explicit separation of 401 (unauthenticated) vs 403 (forbidden)

**Why**: Client applications need predictable error formats to handle failures gracefully.

### 5. **Database Design**
- **Users**: `id`, `name`, `email`, `password_hash`, `created_at`
- **Projects**: `id`, `name`, `description`, `owner_id`, `created_at`
- **Tasks**: `id`, `title`, `description`, `status`, `priority`, `project_id`, `assignee_id`, `due_date`, `created_at`, `updated_at`

Foreign keys enforce referential integrity. Nullable `assignee_id` allows unassigned tasks.

### 6. **What Was Intentionally Left Out (and Why)**

| Feature | Reason |
|---------|--------|
| Real-time WebSockets | Not required for MVP; REST polling sufficient |
| Pagination | Implemented as bonus; can be added to `/projects` and `/projects/:id/tasks` |
| Request rate limiting | Assume trusted users in assessment scenario |
| Email notifications | Out of scope for API-only backend |
| Soft deletes | Hard deletes simpler for MVP; can audit-log if needed |
| Task history/audit log | Not required; `updated_at` timestamp sufficient |

---

## Running Locally

### Prerequisites
- Docker & Docker Compose installed
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/animeshj997-stack/taskflow--Animesh-Jain-.git
cd taskflow--Animesh-Jain-

# 2. Copy environment file
cp .env.example .env

# 3. Start all services (PostgreSQL + API server)
docker compose up

# 4. API is ready at http://localhost:3000
# Swagger docs at http://localhost:3000/api-docs
```

That's it. Migrations run automatically on startup.

### Manual Docker Steps (if needed)

```bash
# Build the Docker image
docker build -t taskflow-api .

# Run with compose
docker compose up --build

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

### Environment Variables

See `.env.example` for all options. Key variables:

```env
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USER=taskflow
DB_PASSWORD=taskflow_password
DB_NAME=taskflow_db
JWT_SECRET=your-secret-key-change-in-production
```

---

## Running Migrations

Migrations run **automatically** when the container starts. The startup script checks for pending migrations and applies them.

### Manual Migration Commands

If needed, you can run migrations manually inside the container:

```bash
# Run pending migrations
docker compose exec api npm run migrate

# To verify applied migrations
docker compose ps  # Check container is running
docker compose exec api node scripts/check-migrations.js
```

### Migration Files

All migrations are in `src/db/migrations/`:
- `001_create_users_*.sql` — User table
- `002_create_projects_*.sql` — Project table
- `003_create_tasks_*.sql` — Task table

Each file has:
- `*_up.sql` — Create/modify schema
- `*_down.sql` — Rollback (rarely used in production)

---

## Test Credentials

After the app starts, the database is seeded with a test user. Use these to log in:

```
Email:    test@example.com
Password: password123
```

This user has 1 sample project with 3 sample tasks (statuses: todo, in_progress, done).

### Register New Users

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

---

## API Reference

### Base URL
- **Local**: `http://localhost:3000`
- **Live**: `http://13.233.92.74:3000`

### Full API Documentation
**Interactive Swagger UI**: http://localhost:3000/api-docs (or live URL above)

### Quick Endpoint Summary

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

#### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List user's projects |
| POST | `/projects` | Create new project |
| GET | `/projects/:id` | Get project + tasks |
| PATCH | `/projects/:id` | Update project (owner only) |
| DELETE | `/projects/:id` | Delete project (owner only) |

#### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/tasks` | List project tasks (with filters) |
| POST | `/projects/:id/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

### Example Requests

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { "id": "uuid", "name": "Test User", "email": "test@example.com" }
# }
```

**Create a task:**
```bash
curl -X POST http://localhost:3000/projects/{projectId}/tasks \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix homepage layout",
    "description": "Responsive design issues",
    "status": "todo",
    "priority": "high",
    "due_date": "2026-04-20"
  }'
```

**Filter tasks by status:**
```bash
curl http://localhost:3000/projects/{projectId}/tasks?status=in_progress \
  -H "Authorization: Bearer {token}"
```

For complete request/response examples, visit the **Swagger UI** at `http://localhost:3000/api-docs`.

---

## What You'd Do With More Time

### High Priority
1. **Add Pagination** — Implement `?page=1&limit=20` on list endpoints to handle large datasets
2. **Integration Tests** — Write tests for auth flow, project creation, and task updates using Jest + supertest
3. **Task Stats Endpoint** — `GET /projects/:id/stats` showing task counts by status and assignee
4. **Field Validation Improvements** — Add date range validation, task title length constraints
5. **Indexed Queries** — Add database indexes on `project_id`, `assignee_id` for faster filtering

### Medium Priority
6. **Real-time Updates via WebSockets** — Push task changes to connected clients instantly
7. **Activity Audit Log** — Track who changed what task and when (useful for disputes)
8. **Task Dependencies** — Model tasks that block other tasks
9. **Notifications** — Email users when assigned a task or when a task is due soon
10. **Request Logging Middleware** — Log all API requests with timing for debugging

### Polish & DevEx
11. **Rate Limiting** — Prevent brute force attacks on login
12. **CORS Configuration** — Proper origin whitelisting if frontend is separate
13. **Database Connection Pooling Tuning** — Optimize pool size for concurrent requests
14. **Better Error Messages** — More specific validation errors (e.g., "password must be 8+ characters")
15. **OpenAPI 3.1 Spec Export** — Generate formal API spec from swagger.js for client SDKs

### Known Limitations
- **No soft deletes**: Deleted tasks are permanently removed. Adding a `deleted_at` timestamp would allow recovery.
- **No project visibility levels**: All tasks visible to all project members. Could add `public`/`private` settings.
- **No change history**: Can't see who changed a task's status. Would need an audit table.
- **Single JWT signature key**: In multi-server setup, would need key rotation mechanism.
- **No request validation on PATCH**: Could validate that only allowed fields are updated.

---

## Deployment Notes

### Docker Image
- **Base Image**: Node.js 20 Alpine (minimal, ~150MB)
- **Multi-stage build**: Dependencies cached in build stage, runtime stage doesn't include dev deps
- **Health check**: Container reports healthy once migrations complete and API starts

### Running in Production
```bash
# Start with PM2 process manager
npm start

# Restart if needed
npm restart

# Stop the process
npm stop
```

### Environment
Update `.env` for production:
```env
NODE_ENV=production
JWT_SECRET=use-a-strong-random-key-from-env-variable
DB_PASSWORD=strong-postgres-password
DB_HOST=production-rds-endpoint.aws.amazon.com
```

Never commit `.env` to git.

---

## File Structure

```
taskflow--Animesh-Jain-/
├── src/
│   ├── server.js              # Express app entry point
│   ├── swagger.js             # OpenAPI/Swagger configuration
│   ├── constants/
│   │   └── constants.js       # App-wide constants
│   ├── controllers/
│   │   ├── loginController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── services/
│   │   ├── loginService.js
│   │   ├── projectService.js
│   │   └── taskService.js
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── projectRepository.js
│   │   └── taskRepository.js
│   ├── routes/
│   │   ├── loginRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── db/
│   │   ├── pool.js            # PostgreSQL connection pool
│   │   ├── seed.sql           # Sample data
│   │   └── migrations/
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_projects.sql
│   │       └── 003_create_tasks.sql
│   └── utils/
│       ├── errorHandler.js
│       ├── handleResponse.js
│       ├── logger.js
│       └── validationHelper.js
├── Dockerfile                 # Multi-stage build
├── docker-compose.yml         # PostgreSQL + API orchestration
├── migrations.js              # Migration runner
├── package.json
├── .env.example               # Template for environment variables
└── README.md                  # This file
```

---

---

**Built with**: Node.js, Express, PostgreSQL, Docker  
**Status**: Complete & Deployable