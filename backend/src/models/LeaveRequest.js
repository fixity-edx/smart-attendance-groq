import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    reason: { type: String, required: true },

    status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },

    aiLeaveMessage: { type: String, default: "" },

    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LeaveRequest", leaveSchema);
