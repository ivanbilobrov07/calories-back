# CalorieTracker

CalorieTracker is a full-stack web app for tracking meals, calories, and macros.

## Tech Stack
- Frontend: React 18 + Vite + React Router + Recharts
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- Auth: JWT in HTTP-only cookie
- External integration: USDA FoodData Central API (food search)

## Backend Architecture (Code Layers)
- `routes/*`: endpoint mapping and auth protection.
- `controllers/*`: request validation + response shaping.
- `services/*`: domain logic (auth, foods, logs, stats, users).
- `prisma/client.js`: DB client singleton.
- `middleware/auth.js`: reads JWT from `token` cookie.
- `utils/*`: JWT, cookie config, BMR and nutrition calculations.

## Main API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/foods/search?q=...`
- `POST /api/foods/custom`
- `GET /api/logs?date=YYYY-MM-DD`
- `POST /api/logs`
- `PUT /api/logs/:id`
- `DELETE /api/logs/:id`
- `GET /api/logs/paginated?page=1`
- `GET /api/stats/weekly`

## Data Model (Prisma)
- `User`
- `Food`
- `MealLog`
- `MealLogItem`

## Environment Variables

### Backend (`backend/.env`)
- `PORT=4000`
- `FRONTEND_URL=http://localhost:5173`
- `DATABASE_URL=postgresql://user:password@localhost:5432/calorie_tracker`
- `JWT_SECRET=your_jwt_secret`
- `FOOD_API_KEY=your_usda_api_key`

### Frontend (`frontend/.env`)
- `VITE_API_URL=http://localhost:4000`

## Run Locally
1. Start PostgreSQL:
   - `cd backend`
   - `docker compose up -d`
2. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
3. Apply Prisma migrations:
   - `cd ../backend`
   - `npm run prisma:migrate`
4. Start backend:
   - `npm run dev`
5. Start frontend (new terminal):
   - `cd ../frontend`
   - `npm run dev`

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
