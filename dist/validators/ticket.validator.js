"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketsQueryValidator = exports.moveTicketValidator = exports.updateTicketValidator = exports.createTicketValidator = void 0;
const express_validator_1 = require("express-validator");
const app_constants_1 = require("../constants/app.constants");
exports.createTicketValidator = [
    (0, express_validator_1.param)("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
    (0, express_validator_1.body)("title")
        .trim()
        .notEmpty()
        .withMessage("Ticket title is required")
        .isLength({ min: 2, max: 200 })
        .withMessage("Title must be between 2 and 200 characters"),
    (0, express_validator_1.body)("description").optional().isString().withMessage("Description must be a string"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(app_constants_1.TICKET_STATUS)
        .withMessage(`Status must be one of: ${app_constants_1.TICKET_STATUS.join(", ")}`),
    (0, express_validator_1.body)("estimation")
        .optional({ nullable: true })
        .isIn(app_constants_1.ESTIMATION_OPTIONS)
        .withMessage(`Estimation must be one of: ${app_constants_1.ESTIMATION_OPTIONS.join(", ")}`),
    (0, express_validator_1.body)("sprintId")
        .optional({ nullable: true })
        .custom((value) => value === null || (Number.isInteger(value) && value > 0))
        .withMessage("Sprint ID must be a positive integer or null"),
    (0, express_validator_1.body)("assigneeId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Assignee ID must be a positive integer"),
    (0, express_validator_1.body)("authorId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Author ID must be a positive integer"),
];
exports.updateTicketValidator = [
    (0, express_validator_1.param)("ticketId").isInt({ min: 1 }).withMessage("Invalid ticket ID"),
    (0, express_validator_1.body)("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ min: 2, max: 200 })
        .withMessage("Title must be between 2 and 200 characters"),
    (0, express_validator_1.body)("description").optional().isString().withMessage("Description must be a string"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(app_constants_1.TICKET_STATUS)
        .withMessage(`Status must be one of: ${app_constants_1.TICKET_STATUS.join(", ")}`),
    (0, express_validator_1.body)("estimation")
        .optional({ nullable: true })
        .isIn([...app_constants_1.ESTIMATION_OPTIONS, null])
        .withMessage(`Estimation must be one of: ${app_constants_1.ESTIMATION_OPTIONS.join(", ")}`),
    (0, express_validator_1.body)("assigneeId")
        .optional({ nullable: true })
        .custom((value) => value === null || (Number.isInteger(value) && value > 0))
        .withMessage("Assignee ID must be a positive integer or null"),
    (0, express_validator_1.body)("authorId")
        .optional({ nullable: true })
        .custom((value) => value === null || (Number.isInteger(value) && value > 0))
        .withMessage("Author ID must be a positive integer or null"),
    (0, express_validator_1.body)("sprintId")
        .optional({ nullable: true })
        .custom((value) => value === null || (Number.isInteger(value) && value > 0))
        .withMessage("Sprint ID must be a positive integer or null"),
];
exports.moveTicketValidator = [
    (0, express_validator_1.param)("ticketId").isInt({ min: 1 }).withMessage("Invalid ticket ID"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(app_constants_1.TICKET_STATUS)
        .withMessage(`Status must be one of: ${app_constants_1.TICKET_STATUS.join(", ")}`),
    (0, express_validator_1.body)("position").optional().isInt({ min: 0 }).withMessage("Position must be a non-negative integer"),
    (0, express_validator_1.body)("sprintId")
        .optional({ nullable: true })
        .custom((value) => value === null || (Number.isInteger(value) && value > 0))
        .withMessage("Sprint ID must be a positive integer or null"),
];
exports.getTicketsQueryValidator = [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 500 }).withMessage("Limit must be between 1 and 500"),
    (0, express_validator_1.query)("status").optional().isIn(app_constants_1.TICKET_STATUS).withMessage("Invalid status filter"),
    (0, express_validator_1.query)("estimation").optional().isIn(app_constants_1.ESTIMATION_OPTIONS).withMessage("Invalid estimation filter"),
    (0, express_validator_1.query)("assigneeId").optional().isInt({ min: 1 }).withMessage("Invalid assignee ID"),
    (0, express_validator_1.query)("sprintId")
        .optional()
        .custom((value) => value === "null" || (Number.isInteger(Number(value)) && Number(value) > 0))
        .withMessage("Sprint ID must be a positive integer or 'null' for backlog"),
    (0, express_validator_1.query)("search").optional().isString().isLength({ max: 100 }).withMessage("Search must be a string under 100 chars"),
];
//# sourceMappingURL=ticket.validator.js.map