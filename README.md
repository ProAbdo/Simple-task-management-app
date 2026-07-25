# Task Management Application

Full-stack MERN task manager for the Electro Pi technical assessment. It
provides JWT authentication, user-owned task management, a responsive React
interface, and production-oriented Docker services.

## Implemented Features

- User registration and login
- Bcrypt password hashing
- JWT access tokens and protected routes
- Per-user task ownership
- Create, list, read, update, and delete tasks
- Case-insensitive task title search
- Status and priority filtering
- Paginated task lists with validated page sizes and navigation metadata
- Accessible drag-and-drop task status changes with a select fallback
- Private task attachments with upload, download, and deletion controls
- Optional attachments can be selected while creating a task and are uploaded
  immediately after the task is saved
- Responsive React authentication and task-management interface
- Dedicated task-details pages with full descriptions, timelines, status
  controls, and attachment summaries
- Task creation, editing, quick status updates, and safe deletion flows
- Backend validation for bodies, route parameters, and query parameters
- Consistent success and error responses
- Integration tests using an isolated in-memory MongoDB instance
- Multi-stage frontend and backend Docker images
- Docker Compose orchestration with MongoDB and service health checks

## Technology

- Node.js
- TypeScript
- Express
- MongoDB and Mongoose
- Zod
- Vitest and Supertest
- React, Vite, TanStack Query, React Hook Form, Zod, Tailwind CSS, and dnd-kit
- Multer for validated multipart attachment uploads
- Docker, Docker Compose, and Nginx

## Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB connection for development and production

Alternatively, Docker and Docker Compose can run the complete stack without a
local Node.js or MongoDB installation.

The automated tests manage their own temporary MongoDB instance and do not
require a locally running database.

## Docker Setup

Create the root Docker environment file:

```powershell
Copy-Item .env.docker.example .env
```

On macOS or Linux:

```bash
cp .env.docker.example .env
```

Replace the example `JWT_SECRET` in `.env` with a private random value of at
least 32 characters. Then build and start the complete stack:

```bash
docker compose up --build -d
```

The services are available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/v1`
- Frontend health check: `http://localhost:3000/healthz`
- Backend health check: `http://localhost:5000/api/v1/health`

The frontend uses `/api/v1` in production. Nginx proxies those browser requests
to the backend container, so API traffic remains on the same browser origin.

Inspect service health and logs:

```bash
docker compose ps
docker compose logs -f
```

Stop the services while preserving MongoDB data:

```bash
docker compose down
```

To also remove the MongoDB and attachment volumes and all containerized
application data:

```bash
docker compose down -v
```

## Setup

### Backend

From the repository root, install the backend dependencies:

```bash
cd backend
npm ci
```

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Update `.env` with an accessible MongoDB connection and a strong JWT secret,
then start the development server:

```bash
npm run dev
```

The default API address is `http://localhost:5000/api/v1`.

### Frontend

In a second terminal, install the frontend dependencies:

```bash
cd frontend
npm ci
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

The example file points to the default local backend. Start the Vite
development server:

```bash
npm run dev
```

The frontend is available at `http://localhost:5173`.

## Environment Variables

### Backend

| Variable | Purpose | Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/electro_pi_tasks` |
| `JWT_SECRET` | JWT signing secret; minimum 32 characters | Use a private random value |
| `JWT_EXPIRES_IN` | Access-token lifetime | `7d` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt work factor from 10 through 14 | `12` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `UPLOAD_DIRECTORY` | Private attachment storage directory | `storage/uploads` |
| `MAX_ATTACHMENT_SIZE_MB` | Maximum size of one attachment, from 1 through 25 MB | `5` |

### Frontend

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

Secrets and local `.env` files must not be committed. Variables prefixed with
`VITE_` are included in the browser bundle and must never contain secrets.

## Available Commands

### Backend

```bash
npm run dev             # Start the development server with file watching
npm run typecheck       # Type-check production source
npm run clean           # Remove compiled output
npm run build           # Compile TypeScript into dist
npm start               # Run the compiled server
npm test                # Run all integration tests once
npm run test:watch      # Run tests in watch mode
npm run test:typecheck  # Type-check source and test files
```

### Frontend

```bash
npm run dev             # Start the Vite development server
npm run typecheck       # Type-check the application
npm run lint            # Run ESLint
npm run lint:fix        # Fix safe lint violations
npm run format:check    # Check Prettier formatting
npm run format          # Format supported files
npm run build           # Create a production bundle
npm run preview         # Preview the production bundle locally
```

## Project Structure

```text
.
├── backend/                    # Express, MongoDB, and API tests
├── frontend/                   # React single-page application
├── compose.yaml                # Local multi-service orchestration
├── .env.docker.example         # Docker environment template
├── README.md
backend/
├── src/
│   ├── config/                 # Environment and database configuration
│   ├── modules/
│   │   ├── auth/               # Registration, login, and JWT service
│   │   ├── health/             # Health endpoint
│   │   ├── tasks/              # Task model and business behavior
│   │   └── users/              # User domain model
│   ├── shared/
│   │   ├── errors/             # Application error type
│   │   └── middleware/         # Auth, validation, and error middleware
│   ├── types/                  # Express type augmentation
│   ├── api.routes.ts           # API route composition
│   ├── app.ts                  # Express application configuration
│   └── server.ts               # Database and HTTP server lifecycle
├── tests/
│   ├── helpers/                # Shared API test utilities
│   ├── auth.api.test.ts
│   ├── tasks.api.test.ts
│   └── setup.ts
├── .env.example
├── package.json
└── tsconfig.json
```

```text
frontend/
├── src/
│   ├── api/                    # Shared Axios client and API error handling
│   ├── components/             # Reusable common and UI components
│   ├── config/                 # Frontend environment configuration
│   ├── features/
│   │   ├── auth/               # Auth state, API, validation, and pages
│   │   └── tasks/              # Task API, UI, validation, types, and pages
│   ├── providers/              # Application-wide providers
│   ├── routes/                 # Route composition and lazy page loading
│   ├── styles/                 # Tailwind and global styles
│   ├── App.tsx                 # Root route outlet
│   └── main.tsx                # Application bootstrap
├── .env.example
├── package.json
└── vite.config.ts
```

The backend follows a direct flow:

```text
Route -> Controller -> Service -> Mongoose Model
```

Controllers handle HTTP concerns, services contain business logic, and models
define persistence. Cross-cutting middleware is kept under `shared`.

## API Endpoints

### Health

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | No | Check API process health |

### Authentication

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | Register a user and return an access token |
| `POST` | `/api/v1/auth/login` | No | Authenticate and return an access token |

Registration body:

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "correct horse battery staple"
}
```

Login body:

```json
{
  "email": "user@example.com",
  "password": "correct horse battery staple"
}
```

Send the returned access token on protected endpoints:

```http
Authorization: Bearer <access-token>
```

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/tasks` | Create a task |
| `GET` | `/api/v1/tasks` | List the authenticated user's tasks |
| `GET` | `/api/v1/tasks/:taskId` | Get one owned task |
| `PATCH` | `/api/v1/tasks/:taskId` | Update one or more task fields |
| `DELETE` | `/api/v1/tasks/:taskId` | Delete an owned task |
| `POST` | `/api/v1/tasks/:taskId/attachments` | Upload one attachment using multipart field `file` |
| `GET` | `/api/v1/tasks/:taskId/attachments/:attachmentId` | Download an owned attachment |
| `DELETE` | `/api/v1/tasks/:taskId/attachments/:attachmentId` | Delete an owned attachment |

Task body:

```json
{
  "title": "Prepare assignment",
  "description": "Complete the backend implementation",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-08-01T18:00:00.000Z"
}
```

Supported status values:

- `todo`
- `in_progress`
- `done`

Supported priority values:

- `low`
- `medium`
- `high`

The list endpoint supports optional, combinable query parameters:

```http
GET /api/v1/tasks?search=assignment
GET /api/v1/tasks?status=done
GET /api/v1/tasks?priority=high
GET /api/v1/tasks?search=release&status=done&priority=high
GET /api/v1/tasks?page=2&limit=9
```

Search matches task titles case-insensitively. Unknown query parameters and
invalid enum values are rejected. `page` defaults to `1`, `limit` defaults to
`9`, and the maximum supported limit is `30`.

List responses include navigation metadata:

```json
{
  "success": true,
  "data": {
    "tasks": [],
    "pagination": {
      "page": 1,
      "limit": 9,
      "totalItems": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

Attachments accept PDF, PNG, JPEG, WebP, plain-text, and Word document files.
Each task can contain up to five attachments. The default maximum file size is
5 MB and can be configured with `MAX_ATTACHMENT_SIZE_MB`.

## Response Format

Successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains invalid data",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

Successful deletion returns `204 No Content`.

## Security and Ownership

- Password hashes are excluded from normal database queries.
- Login failures do not reveal whether an email is registered.
- JWT verification accepts only the configured HMAC algorithm.
- All task queries include the authenticated user ID.
- Attachment upload, download, and deletion require ownership of the parent
  task; storage file names are never exposed by the API.
- Attachment type, size, count, route parameters, and parent ownership are
  validated on the backend.
- Cross-user task access returns `404 TASK_NOT_FOUND`.
- Request data is validated before reaching business logic.
- Helmet, CORS, body-size limits, and hidden Express headers are enabled.

## Tests

Run the complete suite:

```bash
npm test
```

The tests cover registration, login, password hashing, protected endpoints,
invalid JWT rejection, task CRUD, validation, ownership isolation, title
search, combined filters, pagination, and the attachment lifecycle.
