import { Router } from 'express';
import * as quizService from '../services/quizService.js';
import { config } from '../config/index.js';

const router = Router();
const topN = config.leaderboardTopN;

/**
 * GET /v1/leaderboard/score
 * Query: limit (optional)
 */
router.get('/score', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || topN, 10) || topN, 500);
    const data = await quizService.getLeaderboardScore(limit);
    res.json(data);
  } catch (err) {
    console.error('GET /leaderboard/score', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /v1/leaderboard/streak
 * Query: limit (optional)
 */
router.get('/streak', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || topN, 10) || topN, 500);
    const data = await quizService.getLeaderboardStreak(limit);
    res.json(data);
  } catch (err) {
    console.error('GET /leaderboard/streak', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
