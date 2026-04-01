import { body } from "express-validator";

export const leaveRules = [
  body("fromDate").notEmpty().withMessage("fromDate required"),
  body("toDate").notEmpty().withMessage("toDate required"),
  body("reason").trim().isLength({ min: 10 }).withMessage("Reason min 10 chars"),
];

export const leaveStatusRules = [
  body("status").isIn(["approved","rejected"]).withMessage("Invalid status"),
];
