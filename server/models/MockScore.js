import mongoose from "mongoose";

const mockScoreSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["aptitude", "dsa", "mock-interview", "gd"],
      required: true,
    },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true, default: 100 },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("MockScore", mockScoreSchema);
