import mongoose from 'mongoose';

const answerLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    difficulty: { type: Number, required: true },
    answer: { type: String, required: true },
    correct: { type: Boolean, required: true },
    scoreDelta: { type: Number, required: true },
    streakAtAnswer: { type: Number, required: true },
    answeredAt: { type: Date, default: Date.now },
    idempotencyKey: { type: String },
  },
  { timestamps: true }
);

answerLogSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
answerLogSchema.index({ userId: 1, answeredAt: -1 });
answerLogSchema.index({ userId: 1, questionId: 1 });

export const AnswerLog = mongoose.model('AnswerLog', answerLogSchema);
