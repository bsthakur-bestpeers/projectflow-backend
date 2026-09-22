import { body, param } from "express-validator";

export const registerValidator = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const addMemberValidator = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
];

export const removeMemberValidator = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
  param("userId").isInt({ min: 1 }).withMessage("Invalid user ID"),
];
