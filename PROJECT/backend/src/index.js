import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import quizRoutes from './routes/quiz.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { Question } from './models/Question.js';
import { runSeed } from './scripts/seed.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: { error: 'Too many requests' },
});
app.use('/v1/', limiter);

app.use('/v1/quiz', quizRoutes);
app.use('/v1/leaderboard', leaderboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      const count = await runSeed();
      console.log(`Seeded ${count} questions (empty DB).`);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`BrainBolt API listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
