/**
 * Score calculation: difficulty weight + streak multiplier (capped).
 * scoreDelta = baseScore * difficultyWeight * min(streakMultiplier, maxStreakMultiplier)
 */

import { config } from '../config/index.js';

const { baseScorePerCorrect, maxStreakMultiplier, minDifficulty, maxDifficulty } = config;

/**
 * Streak multiplier: 1 + (streak * 0.2), capped at maxStreakMultiplier.
 * e.g. streak 0 -> 1, streak 5 -> 2, streak 20 -> 5 (cap).
 */
export function getStreakMultiplier(streak) {
  const raw = 1 + streak * 0.2;
  return Math.min(maxStreakMultiplier, Math.max(1, raw));
}

/**
 * Difficulty weight: linear in difficulty (e.g. 1 -> 1, 10 -> 2 or similar).
 * Using: 0.5 + (difficulty / maxDifficulty) * 1.5 so range ~0.5 to 2.
 */
export function getDifficultyWeight(difficulty) {
  const normalized = (difficulty - minDifficulty) / (maxDifficulty - minDifficulty || 1);
  return 0.5 + normalized * 1.5;
}

/**
 * Score delta for a correct answer. Wrong answer returns 0.
 */
export function computeScoreDelta(correct, difficulty, streakAtAnswer) {
  if (!correct) return 0;
  const weight = getDifficultyWeight(difficulty);
  const mult = getStreakMultiplier(streakAtAnswer);
  return Math.round(baseScorePerCorrect * weight * mult);
}
