import mongoose from 'mongoose';
import crypto from 'crypto';

const choiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema(
  {
    difficulty: { type: Number, required: true, min: 1, max: 10 },
    prompt: { type: String, required: true },
    choices: [choiceSchema],
    correctAnswerHash: { type: String, required: true }, // hash of correct choice id for verification
    tags: [String],
  },
  { timestamps: true }
);

questionSchema.index({ difficulty: 1 });
questionSchema.index({ difficulty: 1, _id: 1 });

export const Question = mongoose.model('Question', questionSchema);

export function hashAnswer(choiceId) {
  return crypto.createHash('sha256').update(String(choiceId)).digest('hex');
}
