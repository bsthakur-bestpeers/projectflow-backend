import { body, param, query } from "express-validator";
import { TICKET_STATUS, ESTIMATION_OPTIONS } from "../constants/app.constants";

export const createTicketValidator = [
  param("projectId").isInt({ min: 1 }).withMessage("Invalid project ID"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Ticket title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Title must be between 2 and 200 characters"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("status")
    .optional()
    .isIn(TICKET_STATUS)
    .withMessage(`Status must be one of: ${TICKET_STATUS.join(", ")}`),
  body("estimation")
    .optional({ nullable: true })
    .isIn(ESTIMATION_OPTIONS)
    .withMessage(`Estimation must be one of: ${ESTIMATION_OPTIONS.join(", ")}`),
  body("sprintId")
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage("Sprint ID must be a positive integer or null"),
  body("assigneeId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Assignee ID must be a positive integer"),
  body("authorId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Author ID must be a positive integer"),
];

export const updateTicketValidator = [
  param("ticketId").isInt({ min: 1 }).withMessage("Invalid ticket ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 2, max: 200 })
    .withMessage("Title must be between 2 and 200 characters"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("status")
    .optional()
    .isIn(TICKET_STATUS)
    .withMessage(`Status must be one of: ${TICKET_STATUS.join(", ")}`),
  body("estimation")
    .optional({ nullable: true })
    .isIn([...ESTIMATION_OPTIONS, null])
    .withMessage(`Estimation must be one of: ${ESTIMATION_OPTIONS.join(", ")}`),
  body("assigneeId")
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage("Assignee ID must be a positive integer or null"),
  body("authorId")
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage("Author ID must be a positive integer or null"),
  body("sprintId")
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage("Sprint ID must be a positive integer or null"),
];

export const moveTicketValidator = [
  param("ticketId").isInt({ min: 1 }).withMessage("Invalid ticket ID"),
  body("status")
    .optional()
    .isIn(TICKET_STATUS)
    .withMessage(`Status must be one of: ${TICKET_STATUS.join(", ")}`),
  body("position").optional().isInt({ min: 0 }).withMessage("Position must be a non-negative integer"),
  body("sprintId")
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(value) && value > 0))
    .withMessage("Sprint ID must be a positive integer or null"),
];

export const getTicketsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 500 }).withMessage("Limit must be between 1 and 500"),
  query("status").optional().isIn(TICKET_STATUS).withMessage("Invalid status filter"),
  query("estimation").optional().isIn(ESTIMATION_OPTIONS).withMessage("Invalid estimation filter"),
  query("assigneeId").optional().isInt({ min: 1 }).withMessage("Invalid assignee ID"),
  query("sprintId")
    .optional()
    .custom((value) => value === "null" || (Number.isInteger(Number(value)) && Number(value) > 0))
    .withMessage("Sprint ID must be a positive integer or 'null' for backlog"),
  query("search").optional().isString().isLength({ max: 100 }).withMessage("Search must be a string under 100 chars"),
];
