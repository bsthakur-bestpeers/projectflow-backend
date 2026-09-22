import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateTicketValidator, moveTicketValidator } from "../validators/ticket.validator";
import { param } from "express-validator";

const router = Router();
router.use(authenticate);

const ticketIdParam = [param("ticketId").isInt({ min: 1 }).withMessage("Invalid ticket ID")];

router.get("/dashboard", ticketController.getDashboard);
router.get("/:ticketId", ticketIdParam, validate, ticketController.getById);
router.patch("/:ticketId", updateTicketValidator, validate, ticketController.update);
router.delete("/:ticketId", ticketIdParam, validate, ticketController.remove);
router.patch("/:ticketId/move", moveTicketValidator, validate, ticketController.move);

export default router;
