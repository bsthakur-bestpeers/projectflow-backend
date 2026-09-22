"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const ticket_validator_1 = require("../validators/ticket.validator");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const ticketIdParam = [(0, express_validator_1.param)("ticketId").isInt({ min: 1 }).withMessage("Invalid ticket ID")];
router.get("/dashboard", ticket_controller_1.ticketController.getDashboard);
router.get("/:ticketId", ticketIdParam, validate_middleware_1.validate, ticket_controller_1.ticketController.getById);
router.patch("/:ticketId", ticket_validator_1.updateTicketValidator, validate_middleware_1.validate, ticket_controller_1.ticketController.update);
router.delete("/:ticketId", ticketIdParam, validate_middleware_1.validate, ticket_controller_1.ticketController.remove);
router.patch("/:ticketId/move", ticket_validator_1.moveTicketValidator, validate_middleware_1.validate, ticket_controller_1.ticketController.move);
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map