import mongoose from "mongoose";

const dailyMetricSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("DailyMetric", dailyMetricSchema);
