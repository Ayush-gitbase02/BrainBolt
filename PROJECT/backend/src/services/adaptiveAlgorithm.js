/**
 * Adaptive difficulty algorithm with anti ping-pong stabilizers.
 *
 * Stabilizers used:
 * 1. Minimum streak required to increase difficulty (streakRequiredToIncrease)
 * 2. Hysteresis: we track recent correct/wrong in a window; decrease only when recentWrong > hysteresisBand
 * 3. Bounds: difficulty clamped to [minDifficulty, maxDifficulty]
 *
 * Pseudocode:
 *   ON CORRECT:
 *     streak = streak + 1
 *     recentCorrect++, recentWrong unchanged (or reset window on significant event)
 *     IF streak >= streakRequiredToIncrease AND currentDifficulty < maxDifficulty:
 *       newDifficulty = currentDifficulty + 1
 *     ELSE:
 *       newDifficulty = currentDifficulty
 *
 *   ON WRONG:
 *     streak = 0
 *     recentWrong++
 *     IF recentWrong > hysteresisBand AND currentDifficulty > minDifficulty:
 *       newDifficulty = currentDifficulty - 1
 *       (optionally reset recentCorrect/recentWrong for new window)
 *     ELSE:
 *       newDifficulty = currentDifficulty
 */

import { config } from '../config/index.js';

const {
  minDifficulty,
  maxDifficulty,
  streakRequiredToIncrease,
  hysteresisBand,
  recentWindowSize,
} = config;

/**
 * Compute next difficulty after a correct answer.
 * @param {number} currentDifficulty
 * @param {number} currentStreak
 * @param {number} recentCorrect
 * @param {number} recentWrong
 * @returns {{ newDifficulty: number, recentCorrect: number, recentWrong: number }}
 */
export function onCorrect(currentDifficulty, currentStreak, recentCorrect, recentWrong) {
  const newRecentCorrect = Math.min(recentCorrect + 1, recentWindowSize);
  const newRecentWrong = Math.max(0, recentWrong - 1); // decay wrong count on correct

  let newDifficulty = currentDifficulty;
  if (
    currentStreak + 1 >= streakRequiredToIncrease &&
    currentDifficulty < maxDifficulty
  ) {
    newDifficulty = currentDifficulty + 1;
  }

  return {
    newDifficulty: Math.min(maxDifficulty, Math.max(minDifficulty, newDifficulty)),
    recentCorrect: newRecentCorrect,
    recentWrong: newRecentWrong,
  };
}

/**
 * Compute next difficulty after a wrong answer.
 * @param {number} currentDifficulty
 * @param {number} recentCorrect
 * @param {number} recentWrong
 * @returns {{ newDifficulty: number, recentCorrect: number, recentWrong: number }}
 */
export function onWrong(currentDifficulty, recentCorrect, recentWrong) {
  const newRecentWrong = Math.min(recentWrong + 1, recentWindowSize);
  const newRecentCorrect = 0;

  let newDifficulty = currentDifficulty;
  if (newRecentWrong > hysteresisBand && currentDifficulty > minDifficulty) {
    newDifficulty = currentDifficulty - 1;
  }

  return {
    newDifficulty: Math.min(maxDifficulty, Math.max(minDifficulty, newDifficulty)),
    recentCorrect: newRecentCorrect,
    recentWrong: newRecentWrong,
  };
}

export function getInitialDifficulty() {
  return minDifficulty;
}

export function clampDifficulty(d) {
  return Math.min(maxDifficulty, Math.max(minDifficulty, d));
}
