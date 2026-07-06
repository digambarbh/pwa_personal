import mongoose from "mongoose";

const streakDaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

export default mongoose.model("StreakDay", streakDaySchema);
