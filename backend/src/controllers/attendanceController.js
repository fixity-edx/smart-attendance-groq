import Attendance from "../models/Attendance.js";
import ReportCache from "../models/ReportCache.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { generateAttendanceSummary } from "../services/groqService.js";

async function recomputeReport(){
  const totalAttendance = await Attendance.countDocuments();
  const totalLeaves = await LeaveRequest.countDocuments();
  const approvedLeaves = await LeaveRequest.countDocuments({ status: "approved" });
  const rejectedLeaves = await LeaveRequest.countDocuments({ status: "rejected" });

  const report = await generateAttendanceSummary({ totalAttendance, totalLeaves, approvedLeaves, rejectedLeaves });

  await ReportCache.findOneAndUpdate(
    { key: "global" },
    { report, updatedAt: new Date() },
    { upsert: true, new: true }
  );
}

export async function listAttendance(req, res, next){
  try{
    const filter = req.user.role === "student" ? { student: req.user._id } : {};
    const items = await Attendance.find(filter).populate("student", "name email").sort({ date: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function logAttendance(req, res, next){
  try{
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const item = await Attendance.create({ date, status: "present", student: req.user._id });

    // AI report refresh in background-ish (await for simplicity)
    await recomputeReport();

    res.status(201).json(item);
  }catch(err){
    if(err.code === 11000){
      res.status(400);
      return next(new Error("Attendance already logged for today"));
    }
    next(err);
  }
}
