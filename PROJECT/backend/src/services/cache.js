import Redis from 'ioredis';
import { config } from '../config/index.js';

let redis = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 100, 3000);
      },
    });
    redis.on('error', (err) => console.error('Redis error:', err));
  }
  return redis;
}

const USER_STATE_PREFIX = 'user_state:';
const USER_STATE_TTL = 300; // 5 min
const QUESTION_POOL_PREFIX = 'question_pool:';
const QUESTION_POOL_TTL = 3600; // 1 hour
const LEADERBOARD_SCORE_KEY = 'leaderboard:score';
const LEADERBOARD_STREAK_KEY = 'leaderboard:streak';
const LEADERBOARD_TTL = config.leaderboardCacheTtlSeconds;

export async function getUserStateCached(userId) {
  const r = getRedis();
  const key = USER_STATE_PREFIX + userId;
  const raw = await r.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setUserStateCached(userId, state) {
  const r = getRedis();
  const key = USER_STATE_PREFIX + userId;
  await r.setex(key, USER_STATE_TTL, JSON.stringify(state));
}

export async function invalidateUserState(userId) {
  const r = getRedis();
  await r.del(USER_STATE_PREFIX + userId);
}

export async function getQuestionPoolCached(difficulty) {
  const r = getRedis();
  const key = QUESTION_POOL_PREFIX + difficulty;
  const raw = await r.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setQuestionPoolCached(difficulty, questionIds) {
  const r = getRedis();
  const key = QUESTION_POOL_PREFIX + difficulty;
  await r.setex(key, QUESTION_POOL_TTL, JSON.stringify(questionIds));
}

export async function invalidateLeaderboardCaches() {
  const r = getRedis();
  await r.del(LEADERBOARD_SCORE_KEY);
  await r.del(LEADERBOARD_STREAK_KEY);
}

export async function getLeaderboardScoreCached() {
  const r = getRedis();
  const raw = await r.get(LEADERBOARD_SCORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setLeaderboardScoreCached(data) {
  const r = getRedis();
  await r.setex(LEADERBOARD_SCORE_KEY, LEADERBOARD_TTL, JSON.stringify(data));
}

export async function getLeaderboardStreakCached() {
  const r = getRedis();
  const raw = await r.get(LEADERBOARD_STREAK_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setLeaderboardStreakCached(data) {
  const r = getRedis();
  await r.setex(LEADERBOARD_STREAK_KEY, LEADERBOARD_TTL, JSON.stringify(data));
}
