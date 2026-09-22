"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMemberValidator = exports.addMemberValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)("full_name")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number"),
];
exports.loginValidator = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.addMemberValidator = [
    (0, express_validator_1.param)("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("User email is required")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
];
exports.removeMemberValidator = [
    (0, express_validator_1.param)("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
    (0, express_validator_1.param)("userId").isInt({ min: 1 }).withMessage("Invalid user ID"),
];
//# sourceMappingURL=auth.validator.js.map