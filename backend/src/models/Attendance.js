import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    status: { type: String, enum: ["present"], default: "present" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
