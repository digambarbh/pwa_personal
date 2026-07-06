import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    minutes: { type: Number, required: true },
    label: { type: String, default: "" }, // e.g. "DSA", "Aptitude" - optional tag
  },
  { timestamps: true }
);

export default mongoose.model("StudySession", studySessionSchema);
