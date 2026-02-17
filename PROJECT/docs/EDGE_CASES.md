# BrainBolt – Edge Cases and Handling

## Adaptive Algorithm Edge Cases

| Edge case | Handling |
|-----------|----------|
| **Ping-pong (correct/wrong alternation)** | (1) Difficulty increases only after `streakRequiredToIncrease` (2) correct answers in a row. (2) Difficulty decreases only when `recentWrong > hysteresisBand` in the recent window. So alternating single correct/single wrong does not flip difficulty every time. |
| **Difficulty at min (1)** | Never decrement below 1; clamp in `onWrong`. |
| **Difficulty at max (10)** | Never increment above 10; clamp in `onCorrect`. |
| **First answer correct** | Streak becomes 1; if `streakRequiredToIncrease` is 2, difficulty does not increase yet. |
| **First answer wrong** | Streak resets to 0; recentWrong increments; if ≤ hysteresisBand, difficulty does not decrease. |
| **Long correct streak at max difficulty** | Difficulty stays at 10; streak and score keep increasing. |
| **Long wrong streak at min difficulty** | Difficulty stays at 1; recentWrong capped by window size. |

## Scoring Edge Cases

| Edge case | Handling |
|-----------|----------|
| **Wrong answer** | scoreDelta = 0; streak reset to 0. |
| **Streak multiplier cap** | Multiplier = min(maxStreakMultiplier, 1 + streak*0.2). Capped so score does not explode. |
| **Difficulty weight** | Linear in [minDifficulty, maxDifficulty]; no negative or zero weight. |
| **First correct answer (streak 0)** | Multiplier = 1; score = base * difficultyWeight. |
| **Very high streak** | Capped by maxStreakMultiplier. |

## User State and Session Edge Cases

| Edge case | Handling |
|-----------|----------|
| **New user** | getOrCreateUserState creates User and UserState with difficulty=1, streak=0, totalScore=0. |
| **Streak decay after inactivity** | If `lastAnswerAt` is older than `streakDecayMinutes`, current streak is set to 0 before processing next answer or showing state. |
| **Missing stateVersion in request** | Backend uses DB state; answer still processed. Optimistic UI can send stateVersion from last next response. |
| **Stale stateVersion** | Backend does not reject; it overwrites state. Idempotency is by answerIdempotencyKey, not by stateVersion. |

## Idempotency and Duplicate Submission

| Edge case | Handling |
|-----------|----------|
| **Duplicate answer (same idempotencyKey)** | AnswerLog has unique index on (userId, idempotencyKey). Second submit with same key finds existing log and returns same result without updating streak/score again. |
| **Double-click submit** | Frontend sends same answerIdempotencyKey; backend returns idempotent response. |
| **Replay of same request** | Same idempotencyKey → same response; no double credit. |

## Leaderboard and Real-Time Edge Cases

| Edge case | Handling |
|-----------|----------|
| **Rank tie (same score/streak)** | Rank = count(strictly better) + 1; ties get same rank. |
| **User not in top N** | Rank still computed and returned in answer response; list shows top N only. |
| **Cache stale** | Leaderboard cache TTL 10 s; invalidated on every answer. Next request after answer gets fresh DB data. |
| **New user on leaderboard** | Upsert on LeaderboardScore and LeaderboardStreak on first answer; user appears in rankings. |

## Question and Answer Edge Cases

| Edge case | Handling |
|-----------|----------|
| **No questions for current difficulty** | getNextQuestion returns prompt/choices null and a message; frontend shows message. |
| **Same question twice** | lastQuestionId excluded from pool when selecting next; if pool is single question, we still return it to avoid empty. |
| **Invalid questionId in answer** | 400/404; no state update. |
| **Answer not in choices** | Compared by hash; wrong if no choice matches. No crash. |
| **Missing userId** | 400 with error message. |

## Boundary Conditions (Summary)

- **Difficulty:** Always in [1, 10].
- **Streak:** Non-negative; resets on wrong; decays after inactivity.
- **Streak multiplier:** In [1, maxStreakMultiplier].
- **totalScore:** Monotonic (never decreases) for a user.
- **maxStreak:** Monotonic per user.
- **stateVersion:** Incremented on every state update.
- **Idempotency:** One logical answer per (userId, idempotencyKey); duplicate key returns same result.
