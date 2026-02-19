# Smart Task Manager

Simple full-stack task manager (TypeScript + Node/Express backend, React + Vite frontend).

**Repository layout**

- **backend/**: Express + TypeScript API and tests.
- **frontend/**: React (Vite) single-page app.

**Prerequisites**

- **Node.js**: v18+ recommended
- **npm**: v9+ (or use the bundled npm with Node)

**Quick Start (development)**
Open two terminals and run backend and frontend separately.

Backend

- File: [backend/package.json](backend/package.json)
- Create a `.env` file in the `backend/` folder with the variables listed below.
- Install & run in development:

```powershell
cd backend
npm install
npm run dev
```

Build & Production start

```powershell
cd backend
npm install
npm run build
npm start
```

Tests (backend)

```powershell
cd backend
npm test
```

Environment variables (create `backend/.env`)

- `PORT` — server port (e.g. `5000`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — token expiration (e.g. `7d`)

Do NOT commit real secrets to source control. Use placeholders or a secrets manager.

Frontend

- File: [frontend/package.json](frontend/package.json)
- Install & run in development:

```powershell
cd frontend
npm install
npm run dev
```

Build & Preview

```powershell
cd frontend
npm install
npm run build
npm run preview
```

Running both services together

- Start the backend (`npm run dev`) in one terminal and the frontend (`npm run dev`) in another.
- The frontend is configured to call the backend API (see `src/services/api.ts`). If you change backend port or host, update the frontend API base URL accordingly.

Notes

- Backend tests use an in-memory MongoDB server; see `tests/` in the `backend/` folder.
- Keep `.env` values out of commits. For deployment, set env vars in your host (Docker, cloud provider, etc.).

Contributing

- Open an issue or a PR describing the change.


