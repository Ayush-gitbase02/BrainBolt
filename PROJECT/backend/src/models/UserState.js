import mongoose from 'mongoose';

const userStateSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    currentDifficulty: { type: Number, required: true, default: 1 },
    streak: { type: Number, required: true, default: 0 },
    maxStreak: { type: Number, required: true, default: 0 },
    totalScore: { type: Number, required: true, default: 0 },
    lastQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    lastAnswerAt: { type: Date },
    stateVersion: { type: Number, required: true, default: 0 },
    // For hysteresis / anti ping-pong: recent correct/wrong counts in window
    recentCorrect: { type: Number, default: 0 },
    recentWrong: { type: Number, default: 0 },
    recentWindowStartAt: { type: Date },
  },
  { timestamps: true }
);

userStateSchema.index({ userId: 1 });
userStateSchema.index({ totalScore: -1 });
userStateSchema.index({ maxStreak: -1 });

export const UserState = mongoose.model('UserState', userStateSchema);
