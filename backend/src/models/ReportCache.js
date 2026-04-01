import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    report: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("ReportCache", reportSchema);
