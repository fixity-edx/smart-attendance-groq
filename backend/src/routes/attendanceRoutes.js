import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { listAttendance, logAttendance } from "../controllers/attendanceController.js";

const router = Router();

router.get("/", protect, listAttendance);
router.post("/log", protect, requireRole("student"), logAttendance);

export default router;
