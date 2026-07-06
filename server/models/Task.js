import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true }, // e.g. "1-day1"
    week: { type: Number, required: true },
    day: { type: Number, required: true },
    done: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
