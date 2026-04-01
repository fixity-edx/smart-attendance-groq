import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { leaveRules, leaveStatusRules } from "../validators/leaveValidators.js";
import { listLeaves, createLeave, updateLeaveStatus } from "../controllers/leaveController.js";

const router = Router();

router.get("/", protect, listLeaves);
router.post("/", protect, requireRole("student"), leaveRules, validate, createLeave);
router.put("/:id/status", protect, requireRole("admin"), leaveStatusRules, validate, updateLeaveStatus);

export default router;
