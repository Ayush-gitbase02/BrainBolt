# BrainBolt – Low-Level Design

## 1. Class / Module Responsibilities

### Backend

| Module | Responsibility |
|--------|----------------|
| `config/index.js` | Central config: port, Mongo/Redis URLs, adaptive params (min/max difficulty, streak required, hysteresis, TTLs). |
| `models/User.js` | User document (id only); used for upsert on first activity. |
| `models/Question.js` | Question document: difficulty, prompt, choices, correctAnswerHash, tags. Provides `hashAnswer(choiceId)` for verification. |
| `models/UserState.js` | Per-user state: currentDifficulty, streak, maxStreak, totalScore, lastQuestionId, lastAnswerAt, stateVersion, recentCorrect, recentWrong, recentWindowStartAt. |
| `models/AnswerLog.js` | Immutable log: userId, questionId, difficulty, answer, correct, scoreDelta, streakAtAnswer, idempotencyKey. |
| `models/LeaderboardScore.js` | Denormalized view: userId, totalScore, updatedAt. |
| `models/LeaderboardStreak.js` | Denormalized view: userId, maxStreak, updatedAt. |
| `services/adaptiveAlgorithm.js` | Pure functions: `onCorrect(…)` / `onWrong(…)` return newDifficulty and updated recent counts; implements minimum streak to increase and hysteresis to avoid ping-pong. |
| `services/scoreService.js` | `getStreakMultiplier(streak)`, `getDifficultyWeight(difficulty)`, `computeScoreDelta(correct, difficulty, streakAtAnswer)`. |
| `services/cache.js` | Redis: user state cache, question pools per difficulty, leaderboard caches; TTLs and invalidation. |
| `services/quizService.js` | Orchestration: getOrCreateUserState, getNextQuestion, submitAnswer (transactional), getMetrics, getLeaderboardScore/Streak, getRankByScore/Streak. |
| `routes/quiz.js` | GET /v1/quiz/next, POST /v1/quiz/answer, GET /v1/quiz/metrics. |
| `routes/leaderboard.js` | GET /v1/leaderboard/score, GET /v1/leaderboard/streak. |
| `scripts/seed.js` | Static question list by difficulty; `runSeed()` for programmatic seed; CLI for one-off seed. |

### Frontend

| Module | Responsibility |
|--------|----------------|
| `styles/design-tokens.css` | CSS variables: colors, spacing, radius, shadows, typography; light/dark. |
| `lib/utils.ts` | `cn()` for class names. |
| `lib/api.ts` | API client: fetchNextQuestion, submitAnswer, fetchMetrics, leaderboards; getOrCreateUserId. |
| `components/ui/*` | Reusable UI: Button, Card, Badge, Container (design tokens only). |
| `components/ThemeToggle.tsx` | Light/dark toggle; persists to localStorage. |
| `components/quiz/QuizQuestion.tsx` | Renders one question; submits answer with idempotency key; callback on result. |
| `components/quiz/ScoreStrip.tsx` | Displays score, streak, max streak, ranks. |
| `components/leaderboard/Leaderboards.tsx` | Fetches and polls score/streak leaderboards; highlights current user. |
| `app/page.tsx` | SSR landing. |
| `app/quiz/page.tsx` | CSR quiz flow: load next → submit → refresh state and leaderboard. |
| `app/metrics/page.tsx` | CSR metrics. |
| `app/leaderboard/page.tsx` | CSR leaderboard. |

---

## 2. API Schemas

### GET /v1/quiz/next

- **Request:** Query: `userId` (required), `sessionId` (optional). Or header `X-User-Id`.
- **Response:**
```json
{
  "questionId": "string | null",
  "difficulty": "number",
  "prompt": "string | null",
  "choices": [{"id": "string", "text": "string"}] | null,
  "sessionId": "string | null",
  "stateVersion": "number",
  "currentScore": "number",
  "currentStreak": "number",
  "message?: "string"
}
```

### POST /v1/quiz/answer

- **Request body:**
```json
{
  "userId": "string",
  "sessionId": "string | null",
  "questionId": "string",
  "answer": "string",
  "stateVersion": "number",
  "answerIdempotencyKey": "string"
}
```
- **Response:**
```json
{
  "correct": "boolean",
  "newDifficulty": "number",
  "newStreak": "number",
  "scoreDelta": "number",
  "totalScore": "number",
  "maxStreak?: "number",
  "stateVersion": "number",
  "leaderboardRankScore": "number",
  "leaderboardRankStreak": "number",
  "idempotent?: "boolean"
}
```

### GET /v1/quiz/metrics

- **Request:** Query: `userId` (or `X-User-Id`).
- **Response:**
```json
{
  "currentDifficulty": "number",
  "streak": "number",
  "maxStreak": "number",
  "totalScore": "number",
  "accuracy": "number",
  "difficultyHistogram": [{"difficulty": "number", "count": "number"}],
  "recentPerformance": [{"questionId": "string", "correct": "boolean", "scoreDelta": "number", "difficulty": "number", "answeredAt": "string"}]
}
```

### GET /v1/leaderboard/score

- **Request:** Query: `limit` (optional, default 100).
- **Response:** `{ "entries": [{"userId": "string", "totalScore": "number", "updatedAt": "string"}], "updatedAt": "string" }`

### GET /v1/leaderboard/streak

- **Request:** Query: `limit` (optional).
- **Response:** `{ "entries": [{"userId": "string", "maxStreak": "number", "updatedAt": "string"}], "updatedAt": "string" }`

---

## 3. DB Schema and Indexes

- **users:** `_id` (String, userId). Index: `createdAt`.
- **questions:** `difficulty`, `prompt`, `choices[]`, `correctAnswerHash`, `tags[]`. Indexes: `difficulty`, `(difficulty, _id)`.
- **user_state:** `userId` (unique), `currentDifficulty`, `streak`, `maxStreak`, `totalScore`, `lastQuestionId`, `lastAnswerAt`, `stateVersion`, `recentCorrect`, `recentWrong`, `recentWindowStartAt`. Indexes: `userId`, `totalScore` (-1), `maxStreak` (-1).
- **answer_log:** `userId`, `questionId`, `difficulty`, `answer`, `correct`, `scoreDelta`, `streakAtAnswer`, `answeredAt`, `idempotencyKey`. Indexes: `(userId, idempotencyKey)` unique sparse, `(userId, answeredAt -1)`, `(userId, questionId)`.
- **leaderboard_score:** `userId` (unique), `totalScore`, `updatedAt`. Indexes: `totalScore` (-1), `userId`.
- **leaderboard_streak:** `userId` (unique), `maxStreak`, `updatedAt`. Indexes: `maxStreak` (-1), `userId`.

---

## 4. Cache Strategy

| Key pattern | TTL | Invalidation |
|-------------|-----|--------------|
| `user_state:{userId}` | 5 min | On every submitAnswer (invalidate then next getNextQuestion repopulates from DB). |
| `question_pool:{difficulty}` | 1 hour | Not invalidated (questions are static; optional invalidation on seed). |
| `leaderboard:score` | 10 s | Invalidated on every submitAnswer. |
| `leaderboard:streak` | 10 s | Invalidated on every submitAnswer. |

**Real-time:** Leaderboard and user state are invalidated on each answer. Next request (next question, metrics, or leaderboard poll) gets fresh data from DB and repopulates cache. Frontend polls leaderboard every 5 s and gets updated state in the very next question response after submit.

---

## 5. Adaptive Algorithm (Pseudocode)

```
CONSTANTS:
  minDifficulty = 1, maxDifficulty = 10
  streakRequiredToIncrease = 2
  hysteresisBand = 1
  recentWindowSize = 5

ON CORRECT(currentDifficulty, currentStreak, recentCorrect, recentWrong):
  newStreak = currentStreak + 1
  newRecentCorrect = min(recentCorrect + 1, recentWindowSize)
  newRecentWrong = max(recentWrong - 1, 0)
  newDifficulty = currentDifficulty
  IF (currentStreak + 1) >= streakRequiredToIncrease AND currentDifficulty < maxDifficulty:
    newDifficulty = currentDifficulty + 1
  RETURN (clamp(newDifficulty), newRecentCorrect, newRecentWrong)

ON WRONG(currentDifficulty, recentCorrect, recentWrong):
  newStreak = 0
  newRecentWrong = min(recentWrong + 1, recentWindowSize)
  newRecentCorrect = 0
  newDifficulty = currentDifficulty
  IF newRecentWrong > hysteresisBand AND currentDifficulty > minDifficulty:
    newDifficulty = currentDifficulty - 1
  RETURN (clamp(newDifficulty), newRecentCorrect, newRecentWrong)
```

Stabilizers: (1) **Minimum streak to increase:** need 2 correct in a row to move up. (2) **Hysteresis:** need more than 1 wrong in the recent window to move down. (3) **Bounds:** difficulty clamped to [1, 10].

---

## 6. Score Calculation (Pseudocode)

```
streakMultiplier(streak) = min(maxStreakMultiplier, 1 + streak * 0.2)
difficultyWeight(diff)   = 0.5 + (diff - minDiff) / (maxDiff - minDiff) * 1.5
scoreDelta(correct, diff, streakAtAnswer):
  IF NOT correct: RETURN 0
  RETURN round(baseScorePerCorrect * difficultyWeight(diff) * streakMultiplier(streakAtAnswer))
```

---

## 7. Leaderboard Update Strategy

- On every `submitAnswer`: within the same transaction we update `UserState`, `AnswerLog`, `LeaderboardScore` (upsert by userId, set totalScore), and `LeaderboardStreak` (upsert, set maxStreak).
- After commit: invalidate Redis `leaderboard:score` and `leaderboard:streak`.
- Rank is computed on demand: count documents with totalScore > user’s totalScore (and similarly for streak), then rank = count + 1. Returned in the answer response and available on next metrics/leaderboard fetch.
- Frontend: after submit, receives new totalScore, newStreak, and ranks in the answer response; leaderboard list is refreshed on next poll (5 s) or when user opens leaderboard.
