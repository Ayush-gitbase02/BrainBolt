import mongoose from 'mongoose';

const leaderboardStreakSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    maxStreak: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leaderboardStreakSchema.index({ maxStreak: -1 });
leaderboardStreakSchema.index({ userId: 1 });

export const LeaderboardStreak = mongoose.model('LeaderboardStreak', leaderboardStreakSchema);
