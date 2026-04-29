# Fraud Detection System

Fullstack implementation with:
- NestJS backend (`backend/`)
- React + Vite + Tailwind frontend (`frontend/`)
- In-memory storage only (no database)
- BullMQ + Redis for background fraud processing

## Backend

1. Start Redis on `127.0.0.1:6379`.
2. Install dependencies:
   - `cd backend`
   - `npm install`
3. Run server:
   - `npm run start:dev`

Backend runs on `http://localhost:3000`.

## Deploy Backend To Render

1. Push this repo to GitHub.
2. In Render, create a Redis instance and copy its internal connection string.
3. Create a new Blueprint service in Render from this repo (uses `render.yaml`).
4. Set env var:
   - `REDIS_URL=<your-render-redis-url>`
   - `CORS_ORIGINS=https://<your-frontend>.onrender.com`
5. Deploy.

Render will:
- build with `npm install && npm run build`
- start with `npm run start:prod`
- inject `PORT` automatically

Important:
- This app uses in-memory storage for jobs/results, so data is lost on restart/redeploy.
- For multi-instance scaling, each instance has its own memory store.

## Frontend

1. Install dependencies:
   - `cd frontend`
   - `npm install`
2. Run app:
   - `npm run dev`

Frontend runs on Vite default port (usually `http://localhost:5173`).

## Deploy Frontend To Render

1. Create a Static Site in Render from this same repo.
2. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. Set env var:
   - `VITE_API_BASE_URL=https://<your-backend>.onrender.com`
4. Deploy.

If you have multiple frontend domains, backend supports comma-separated origins:
- `CORS_ORIGINS=https://site-a.onrender.com,https://site-b.onrender.com`

## API

- `POST /fraud-check` with `multipart/form-data` field `file`
- `GET /fraud-check/:jobId`
- `GET /fraud-check/:jobId/results?page=1&limit=20`

## Fraud Rules

Transactions are flagged if any of:
- More than 5 transactions by same user within 1 minute
- Daily user total exceeds `$10,000`
- Different locations within 2 minutes
