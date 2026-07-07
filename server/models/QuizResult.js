import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

export default mongoose.model("QuizResult", quizResultSchema);
