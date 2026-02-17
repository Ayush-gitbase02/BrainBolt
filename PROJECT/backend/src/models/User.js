import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // userId from auth or generated
  },
  { timestamps: true }
);

userSchema.index({ createdAt: 1 });

export const User = mongoose.model('User', userSchema);
