import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getSummary } from "../controllers/reportController.js";

const router = Router();

router.get("/summary", protect, requireRole("admin"), getSummary);

export default router;
