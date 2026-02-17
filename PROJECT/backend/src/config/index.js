import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/brainbolt',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV || 'development',
  // Adaptive algorithm
  minDifficulty: 1,
  maxDifficulty: 10,
  difficultyStep: 1,
  streakRequiredToIncrease: 2, // minimum correct streak to bump difficulty (anti ping-pong)
  hysteresisBand: 1, // don't decrease until wrong count in window exceeds this
  recentWindowSize: 5,
  // Streak multiplier cap
  maxStreakMultiplier: 5,
  baseScorePerCorrect: 10,
  // Inactivity streak decay (minutes)
  streakDecayMinutes: 30,
  // Leaderboard
  leaderboardTopN: 100,
  leaderboardCacheTtlSeconds: 10,
};
