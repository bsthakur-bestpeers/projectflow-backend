"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintIdParamValidator = exports.updateSprintValidator = exports.createSprintValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createSprintValidator = [
    (0, express_validator_1.param)("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
    (0, express_validator_1.body)("name")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Sprint name must not exceed 100 characters"),
    (0, express_validator_1.body)("start_date")
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601()
        .withMessage("Start date must be a valid ISO 8601 date"),
    (0, express_validator_1.body)("end_date")
        .notEmpty()
        .withMessage("End date is required")
        .isISO8601()
        .withMessage("End date must be a valid ISO 8601 date"),
];
exports.updateSprintValidator = [
    (0, express_validator_1.param)("sprintId").isInt({ min: 1 }).withMessage("Invalid sprint ID"),
    (0, express_validator_1.body)("name")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Sprint name must not exceed 100 characters"),
    (0, express_validator_1.body)("start_date")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid ISO 8601 date"),
    (0, express_validator_1.body)("end_date")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid ISO 8601 date"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"])
        .withMessage("Status must be PLANNED, ACTIVE, COMPLETED, or CANCELLED"),
];
exports.sprintIdParamValidator = [
    (0, express_validator_1.param)("sprintId").isInt({ min: 1 }).withMessage("Invalid sprint ID"),
];
//# sourceMappingURL=sprint.validator.js.map