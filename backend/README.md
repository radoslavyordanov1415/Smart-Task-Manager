# Smart Task Manager  Backend

Node.js + TypeScript + Express + MongoDB REST API with JWT Authentication.

## Requirements

- Node.js 18+
- MongoDB Atlas (or local MongoDB on `mongodb://localhost:27017`)

## Setup

```bash
npm install
```

### Environment Variables (`.env`)

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart-task-manager
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon + ts-node |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled JS from `dist/` |
| `npm test` | Run Jest + Supertest integration tests |

## Auth API  `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` |  | Register `{ username, email, password }`  `{ user, token }` |
| `POST` | `/api/auth/login` |  | Login `{ email, password }`  `{ user, token }` |
| `POST` | `/api/auth/logout` |  | Logout |
| `GET` | `/api/auth/profile` |  | Get current user profile |
| `PATCH` | `/api/auth/profile` |  | Update `username` / `avatar` |

## Tasks API  `/api/tasks` (all require `Authorization: Bearer <token>`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tasks` | Create task `{ title, priority, dueDate? }` |
| `GET` | `/api/tasks` | List tasks  filters: `?priority=&status=&completed=&page=&limit=&sortBy=&order=` |
| `PATCH` | `/api/tasks/:id` | Update task fields |
| `PATCH` | `/api/tasks/:id/complete` | Toggle completion (syncs status) |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/tasks/analytics` | Analytics summary |

## Architecture

```
src/
 models/       # Mongoose schemas (User, Task)
 services/     # Business logic (authService, taskService)
 controllers/  # HTTP handlers (authController, taskController)
 routes/       # Express routers (authRoutes, taskRoutes)
 middleware/   # JWT auth guard (auth.ts)
 types/        # Express Request augmentation
 app.ts        # Express app
 server.ts     # Entry point
```

## Tests

30 integration tests across 2 suites. Uses `mongodb-memory-server`.

```bash
npm test
# Test Suites: 2 passed  |  Tests: 30 passed
```
