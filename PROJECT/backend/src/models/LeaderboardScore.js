import mongoose from 'mongoose';

const leaderboardScoreSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    totalScore: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leaderboardScoreSchema.index({ totalScore: -1 });
leaderboardScoreSchema.index({ userId: 1 });

export const LeaderboardScore = mongoose.model('LeaderboardScore', leaderboardScoreSchema);
