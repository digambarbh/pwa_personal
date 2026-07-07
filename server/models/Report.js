import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalMinutes: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    message: { type: String, required: true },
    acknowledged: { type: Boolean, default: false },
    nextTaskLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
