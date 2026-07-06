import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    status: {
      type: String,
      enum: ["applied", "oa", "interview", "offer", "rejected"],
      default: "applied",
    },
    appliedDate: { type: String, default: null }, // "YYYY-MM-DD"
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
