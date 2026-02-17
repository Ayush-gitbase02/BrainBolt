import { Router } from 'express';
import * as quizService from '../services/quizService.js';

const router = Router();

/**
 * GET /v1/quiz/next
 * Query: userId, sessionId (optional)
 */
router.get('/next', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'userId required (query or X-User-Id header)' });
    }
    const sessionId = req.query.sessionId || null;
    const result = await quizService.getNextQuestion(userId, sessionId);
    res.json(result);
  } catch (err) {
    console.error('GET /quiz/next', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * POST /v1/quiz/answer
 * Body: userId, sessionId, questionId, answer, stateVersion, answerIdempotencyKey
 */
router.post('/answer', async (req, res) => {
  try {
    const body = req.body;
    const userId = body.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    if (!body.questionId || body.answer === undefined) {
      return res.status(400).json({ error: 'questionId and answer required' });
    }
    const result = await quizService.submitAnswer({
      userId,
      sessionId: body.sessionId,
      questionId: body.questionId,
      answer: body.answer,
      stateVersion: body.stateVersion,
      answerIdempotencyKey: body.answerIdempotencyKey,
    });
    res.json(result);
  } catch (err) {
    console.error('POST /quiz/answer', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /v1/quiz/metrics
 * Query: userId
 */
router.get('/metrics', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    const result = await quizService.getMetrics(userId);
    res.json(result);
  } catch (err) {
    console.error('GET /quiz/metrics', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
