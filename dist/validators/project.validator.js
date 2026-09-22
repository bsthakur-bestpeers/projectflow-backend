"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsQueryValidator = exports.projectIdParamValidator = exports.updateProjectValidator = exports.createProjectValidator = void 0;
const express_validator_1 = require("express-validator");
const app_constants_1 = require("../constants/app.constants");
exports.createProjectValidator = [
    (0, express_validator_1.body)("name")
        .trim()
        .notEmpty()
        .withMessage("Project name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Project name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters"),
];
exports.updateProjectValidator = [
    (0, express_validator_1.param)("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Project name cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Project name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(app_constants_1.PROJECT_STATUS)
        .withMessage(`Status must be one of: ${app_constants_1.PROJECT_STATUS.join(", ")}`),
];
exports.projectIdParamValidator = [
    (0, express_validator_1.param)("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
];
exports.getProjectsQueryValidator = [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
//# sourceMappingURL=project.validator.js.map