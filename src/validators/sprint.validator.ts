import { body, param } from "express-validator";

export const createSprintValidator = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
  body("name")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Sprint name must not exceed 100 characters"),
  body("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("end_date")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

export const updateSprintValidator = [
  param("sprintId").isInt({ min: 1 }).withMessage("Invalid sprint ID"),
  body("name")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Sprint name must not exceed 100 characters"),
  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  body("status")
    .optional()
    .isIn(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"])
    .withMessage("Status must be PLANNED, ACTIVE, COMPLETED, or CANCELLED"),
];

export const sprintIdParamValidator = [
  param("sprintId").isInt({ min: 1 }).withMessage("Invalid sprint ID"),
];
