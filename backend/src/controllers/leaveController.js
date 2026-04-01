import LeaveRequest from "../models/LeaveRequest.js";
import Attendance from "../models/Attendance.js";
import ReportCache from "../models/ReportCache.js";
import { generateLeaveMessage, generateAttendanceSummary } from "../services/groqService.js";
import { sendEmail } from "../services/resendService.js";

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

export async function listLeaves(req, res, next){
  try{
    const filter = req.user.role === "student" ? { student: req.user._id } : {};
    const items = await LeaveRequest.find(filter).populate("student", "name email").sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function createLeave(req, res, next){
  try{
    const { fromDate, toDate, reason } = req.body;

    const aiLeaveMessage = await generateLeaveMessage({
      studentName: req.user.name,
      fromDate,
      toDate,
      reason
    });

    const item = await LeaveRequest.create({
      fromDate, toDate, reason,
      aiLeaveMessage,
      student: req.user._id
    });

    await recomputeReport();

    await sendEmail({
      to: process.env.ADMIN_EMAIL || "delivered@resend.dev",
      subject: "New Leave Request",
      html: `<p><b>${req.user.name}</b> requested leave (${fromDate} → ${toDate}).</p>`
    }).catch(()=>{});

    res.status(201).json(item);
  }catch(err){ next(err); }
}

export async function updateLeaveStatus(req, res, next){
  try{
    const { id } = req.params;
    const { status } = req.body;

    const item = await LeaveRequest.findById(id).populate("student", "email name");
    if(!item){ res.status(404); throw new Error("Leave request not found"); }

    item.status = status;
    item.actionBy = req.user._id;
    await item.save();

    await recomputeReport();

    await sendEmail({
      to: item.student.email,
      subject: "Leave Request Updated",
      html: `<p>Hello ${item.student.name},</p><p>Your leave request is <b>${status}</b>.</p>`
    }).catch(()=>{});

    res.json(item);
  }catch(err){ next(err); }
}
