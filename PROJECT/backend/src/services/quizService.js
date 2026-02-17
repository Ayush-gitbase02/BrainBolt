import mongoose from 'mongoose';
import { Question, hashAnswer } from '../models/Question.js';
import { UserState } from '../models/UserState.js';
import { AnswerLog } from '../models/AnswerLog.js';
import { LeaderboardScore } from '../models/LeaderboardScore.js';
import { LeaderboardStreak } from '../models/LeaderboardStreak.js';
import { User } from '../models/User.js';
import { config } from '../config/index.js';
import * as adaptive from './adaptiveAlgorithm.js';
import * as scoreService from './scoreService.js';
import * as cache from './cache.js';

const { streakDecayMinutes, leaderboardTopN } = config;

function applyStreakDecay(lastAnswerAt, currentStreak) {
  if (!lastAnswerAt || currentStreak === 0) return currentStreak;
  const elapsed = (Date.now() - new Date(lastAnswerAt).getTime()) / (60 * 1000);
  if (elapsed >= streakDecayMinutes) return 0;
  return currentStreak;
}

/**
 * Get or create user state (from DB; then optionally sync to cache).
 */
export async function getOrCreateUserState(userId) {
  await User.findOneAndUpdate(
    { _id: userId },
    { $setOnInsert: { _id: userId } },
    { upsert: true }
  );

  let state = await UserState.findOne({ userId });
  if (!state) {
    state = await UserState.create({
      userId,
      currentDifficulty: adaptive.getInitialDifficulty(),
      streak: 0,
      maxStreak: 0,
      totalScore: 0,
      stateVersion: 0,
      recentCorrect: 0,
      recentWrong: 0,
    });
  } else {
    const decayedStreak = applyStreakDecay(state.lastAnswerAt, state.streak);
    if (decayedStreak !== state.streak) {
      state.streak = decayedStreak;
      await state.save();
    }
  }

  const stateObj = state.toObject ? state.toObject() : state;
  await cache.setUserStateCached(userId, {
    ...stateObj,
    lastAnswerAt: state.lastAnswerAt?.toISOString?.(),
    recentWindowStartAt: state.recentWindowStartAt?.toISOString?.(),
  });
  return state;
}

/**
 * Get next question for user. Uses cached state if valid, else DB.
 */
export async function getNextQuestion(userId, sessionId) {
  let state = await cache.getUserStateCached(userId);
  if (!state) {
    const dbState = await getOrCreateUserState(userId);
    state = dbState.toObject ? dbState.toObject() : dbState;
  }

  const difficulty = state.currentDifficulty;
  let pool = await cache.getQuestionPoolCached(difficulty);
  if (!pool || pool.length === 0) {
    const questions = await Question.find({ difficulty })
      .select('_id difficulty prompt choices correctAnswerHash')
      .lean();
    pool = questions.map((q) => q._id.toString());
    if (pool.length > 0) await cache.setQuestionPoolCached(difficulty, pool);
  }

  let questionId = null;
  let question = null;
  const excludeId = state.lastQuestionId?.toString?.() || state.lastQuestionId;
  const available = pool.filter((id) => id !== excludeId);
  const poolToUse = available.length > 0 ? available : pool;

  if (poolToUse.length > 0) {
    const randomIndex = Math.floor(Math.random() * poolToUse.length);
    questionId = poolToUse[randomIndex];
    question = await Question.findById(questionId).lean();
  }

  if (!question) {
    const anyQuestion = await Question.findOne({ difficulty }).lean();
    if (anyQuestion) {
      question = anyQuestion;
      questionId = question._id.toString();
    }
  }

  if (!question) {
    return {
      questionId: null,
      difficulty: state.currentDifficulty,
      prompt: null,
      choices: null,
      sessionId: sessionId || null,
      stateVersion: state.stateVersion,
      currentScore: state.totalScore,
      currentStreak: state.streak,
      message: 'No questions available for current difficulty.',
    };
  }

  const safeQuestion = {
    questionId: question._id.toString(),
    difficulty: question.difficulty,
    prompt: question.prompt,
    choices: question.choices,
    sessionId: sessionId || null,
    stateVersion: state.stateVersion,
    currentScore: state.totalScore,
    currentStreak: state.streak,
  };
  return safeQuestion;
}

/**
 * Submit answer. Idempotent by answerIdempotencyKey.
 */
export async function submitAnswer(payload) {
  const { userId, sessionId, questionId, answer, stateVersion, answerIdempotencyKey } = payload;

  const idempotencyKey = answerIdempotencyKey || `answer-${userId}-${questionId}-${Date.now()}`;

  const existingLog = await AnswerLog.findOne({ userId, idempotencyKey });
  if (existingLog) {
    const state = await UserState.findOne({ userId }).lean();
    const rankScore = await getRankByScore(userId);
    const rankStreak = await getRankByStreak(userId);
    return {
      correct: existingLog.correct,
      newDifficulty: state?.currentDifficulty ?? 1,
      newStreak: state?.streak ?? 0,
      scoreDelta: existingLog.scoreDelta,
      totalScore: state?.totalScore ?? 0,
      stateVersion: state?.stateVersion ?? 0,
      leaderboardRankScore: rankScore,
      leaderboardRankStreak: rankStreak,
      idempotent: true,
    };
  }

  const question = await Question.findById(questionId).lean();
  if (!question) {
    throw new Error('Question not found');
  }

  const correctAnswerHash = question.correctAnswerHash;
  const userHash = hashAnswer(answer);
  const correct = userHash === correctAnswerHash;

  let state = await UserState.findOne({ userId });
  if (!state) {
    await getOrCreateUserState(userId);
    state = await UserState.findOne({ userId });
  }

  const decayedStreak = applyStreakDecay(state.lastAnswerAt, state.streak);
  if (decayedStreak !== state.streak) {
    state.streak = decayedStreak;
    await state.save();
  }

  const streakAtAnswer = state.streak;
  let newStreak, newDifficulty, scoreDelta;
  let recentCorrect = state.recentCorrect ?? 0;
  let recentWrong = state.recentWrong ?? 0;

  if (correct) {
    newStreak = state.streak + 1;
    scoreDelta = scoreService.computeScoreDelta(true, question.difficulty, streakAtAnswer);
    const adj = adaptive.onCorrect(
      state.currentDifficulty,
      state.streak,
      recentCorrect,
      recentWrong
    );
    newDifficulty = adj.newDifficulty;
    recentCorrect = adj.recentCorrect;
    recentWrong = adj.recentWrong;
  } else {
    newStreak = 0;
    scoreDelta = 0;
    const adj = adaptive.onWrong(state.currentDifficulty, recentCorrect, recentWrong);
    newDifficulty = adj.newDifficulty;
    recentCorrect = adj.recentCorrect;
    recentWrong = adj.recentWrong;
  }

  const newMaxStreak = Math.max(state.maxStreak || 0, newStreak);
  const newTotalScore = (state.totalScore || 0) + scoreDelta;
  const newStateVersion = (state.stateVersion || 0) + 1;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await UserState.updateOne(
      { userId },
      {
        $set: {
          currentDifficulty: newDifficulty,
          streak: newStreak,
          maxStreak: newMaxStreak,
          totalScore: newTotalScore,
          lastQuestionId: new mongoose.Types.ObjectId(questionId),
          lastAnswerAt: new Date(),
          stateVersion: newStateVersion,
          recentCorrect,
          recentWrong,
          recentWindowStartAt: state.recentWindowStartAt || new Date(),
        },
      },
      { session }
    );

    await AnswerLog.create(
      [
        {
          userId,
          questionId: new mongoose.Types.ObjectId(questionId),
          difficulty: question.difficulty,
          answer,
          correct,
          scoreDelta,
          streakAtAnswer,
          idempotencyKey,
        },
      ],
      { session }
    );

    await LeaderboardScore.findOneAndUpdate(
      { userId },
      { $set: { totalScore: newTotalScore, updatedAt: new Date() } },
      { upsert: true, session }
    );

    await LeaderboardStreak.findOneAndUpdate(
      { userId },
      { $set: { maxStreak: newMaxStreak, updatedAt: new Date() } },
      { upsert: true, session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  await cache.invalidateUserState(userId);
  await cache.invalidateLeaderboardCaches();

  const rankScore = await getRankByScore(userId);
  const rankStreak = await getRankByStreak(userId);

  return {
    correct,
    newDifficulty,
    newStreak,
    scoreDelta,
    totalScore: newTotalScore,
    maxStreak: newMaxStreak,
    stateVersion: newStateVersion,
    leaderboardRankScore: rankScore,
    leaderboardRankStreak: rankStreak,
  };
}

export async function getRankByScore(userId) {
  const state = await UserState.findOne({ userId }).select('totalScore').lean();
  const totalScore = state?.totalScore ?? 0;
  const count = await LeaderboardScore.countDocuments({ totalScore: { $gt: totalScore } });
  return count + 1;
}

export async function getRankByStreak(userId) {
  const state = await UserState.findOne({ userId }).select('maxStreak').lean();
  const maxStreak = state?.maxStreak ?? 0;
  const count = await LeaderboardStreak.countDocuments({ maxStreak: { $gt: maxStreak } });
  return count + 1;
}

export async function getLeaderboardScore(topN = leaderboardTopN) {
  const cached = await cache.getLeaderboardScoreCached();
  if (cached && Array.isArray(cached.entries)) return cached;

  const entries = await LeaderboardScore.find()
    .sort({ totalScore: -1 })
    .limit(topN)
    .lean();
  const data = { entries, updatedAt: new Date().toISOString() };
  await cache.setLeaderboardScoreCached(data);
  return data;
}

export async function getLeaderboardStreak(topN = leaderboardTopN) {
  const cached = await cache.getLeaderboardStreakCached();
  if (cached && Array.isArray(cached.entries)) return cached;

  const entries = await LeaderboardStreak.find()
    .sort({ maxStreak: -1 })
    .limit(topN)
    .lean();
  const data = { entries, updatedAt: new Date().toISOString() };
  await cache.setLeaderboardStreakCached(data);
  return data;
}

export async function getMetrics(userId) {
  const state = await UserState.findOne({ userId }).lean();
  if (!state) {
    return {
      currentDifficulty: 1,
      streak: 0,
      maxStreak: 0,
      totalScore: 0,
      accuracy: 0,
      difficultyHistogram: [],
      recentPerformance: [],
    };
  }

  const logs = await AnswerLog.find({ userId }).sort({ answeredAt: -1 }).limit(100).lean();
  const total = logs.length;
  const correctCount = logs.filter((l) => l.correct).length;
  const accuracy = total > 0 ? correctCount / total : 0;

  const byDiff = {};
  logs.forEach((l) => {
    byDiff[l.difficulty] = (byDiff[l.difficulty] || 0) + 1;
  });
  const difficultyHistogram = Object.entries(byDiff).map(([d, c]) => ({
    difficulty: Number(d),
    count: c,
  }));

  const recentPerformance = logs.slice(0, 10).map((l) => ({
    questionId: l.questionId?.toString(),
    correct: l.correct,
    scoreDelta: l.scoreDelta,
    difficulty: l.difficulty,
    answeredAt: l.answeredAt,
  }));

  return {
    currentDifficulty: state.currentDifficulty,
    streak: state.streak,
    maxStreak: state.maxStreak,
    totalScore: state.totalScore,
    accuracy,
    difficultyHistogram,
    recentPerformance,
  };
}
