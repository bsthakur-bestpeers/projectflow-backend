import { body, param, query } from "express-validator";
import { PROJECT_STATUS } from "../constants/app.constants";

export const createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

export const updateProjectValidator = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("status")
    .optional()
    .isIn(PROJECT_STATUS)
    .withMessage(`Status must be one of: ${PROJECT_STATUS.join(", ")}`),
];

export const projectIdParamValidator = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
];

export const getProjectsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
