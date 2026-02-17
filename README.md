# BrainBolt – Adaptive Infinite Quiz Platform

One question at a time. Difficulty increases after correct answers and decreases after wrong answers. Live leaderboards by total score and current streak.

---

**👉 Full step-by-step instructions:** see **[RUNNING_GUIDE.md](./RUNNING_GUIDE.md)** for what to install, what to fill in, and how to run (Docker or without Docker).

**👉 For video-guide:** see **[DEMO_VIDEO.md](./DEMO_VIDEO.md)** for how to run , explaining all the features implemented and a walkthrough of both frontend and backend codebases.

---

## Single command to run the entire stack

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:4000  
- **MongoDB:** localhost:27017  
- **Redis:** localhost:6379  

On first run, if the database has no questions, the backend seeds 50 questions (5 per difficulty 1–10). To seed manually:

```bash
docker compose run --rm seed
```

Or without Docker (with Mongo and Redis running locally):

```bash
cd backend && npm install && npm run seed
```

## Running without Docker

1. **MongoDB** and **Redis** must be running.
2. **Backend:**
   ```bash
   cd backend && npm install && npm run dev
   ```
3. **Frontend:** (from project root)
   ```bash
   cd frontend && npm install && npm run dev
   ```
4. Open http://localhost:3000. Set `BACKEND_URL` to `http://localhost:4000` only if you need to override the default rewrite.

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Redis (ioredis). Rate limiting, idempotent answer submission, transactional updates.
- **Frontend:** Next.js 14, React, TypeScript, Tailwind. Design tokens, reusable components, light/dark mode, lazy-loaded quiz route.

## Features

- **Adaptive difficulty:** 1–10; increases after 2 correct in a row, decreases when wrong count in recent window exceeds 1 (anti ping-pong).
- **Streak:** Resets on wrong answer; decays after 30 min inactivity; streak multiplier (capped) applied to score.
- **Score:** Base × difficulty weight × streak multiplier; wrong answers add 0.
- **Live leaderboards:** Top by total score and by max streak; rank returned after each answer; frontend polls every 5 s.
- **Real-time:** Score, streak, difficulty, and leaderboard rank update in the very next response after each answer.

## Project structure

```
├── backend/           # Express API
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/   # adaptive algorithm, score, cache, quiz
│   │   ├── scripts/   # seed
│   │   └── index.js
│   └── Dockerfile
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # pages (SSR home, CSR quiz/metrics/leaderboard)
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/    # design tokens, globals
│   └── Dockerfile
├── docs/
│   ├── LLD.md         # Low-level design
│   └── EDGE_CASES.md  # Edge cases and handling
├── docker-compose.yml
└── README.md
```

## API summary

| Method | Path | Description |
|--------|------|-------------|
| GET | /v1/quiz/next | Next question (query: userId, optional sessionId) |
| POST | /v1/quiz/answer | Submit answer (body: userId, sessionId, questionId, answer, stateVersion, answerIdempotencyKey) |
| GET | /v1/quiz/metrics | User metrics (query: userId) |
| GET | /v1/leaderboard/score | Top by total score |
| GET | /v1/leaderboard/streak | Top by max streak |

