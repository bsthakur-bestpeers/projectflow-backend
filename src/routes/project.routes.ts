import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { memberController } from "../controllers/member.controller";
import { sprintController } from "../controllers/sprint.controller";
import { ticketController } from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
  getProjectsQueryValidator,
} from "../validators/project.validator";
import { addMemberValidator, removeMemberValidator } from "../validators/auth.validator";
import { createSprintValidator } from "../validators/sprint.validator";
import { createTicketValidator, getTicketsQueryValidator } from "../validators/ticket.validator";

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post("/", createProjectValidator, validate, projectController.create);
router.get("/", getProjectsQueryValidator, validate, projectController.list);
router.get("/:projectId", projectIdParamValidator, validate, projectController.getById);
router.get("/:projectId/summary", projectIdParamValidator, validate, projectController.getSummary);
router.patch("/:projectId", updateProjectValidator, validate, projectController.update);
router.delete("/:projectId", projectIdParamValidator, validate, projectController.remove);

// Members
router.get("/:projectId/members", projectIdParamValidator, validate, memberController.list);
router.post("/:projectId/members", addMemberValidator, validate, memberController.add);
router.delete("/:projectId/members/:userId", removeMemberValidator, validate, memberController.remove);

// Sprints under project
router.post("/:projectId/sprints", createSprintValidator, validate, sprintController.create);
router.get("/:projectId/sprints", projectIdParamValidator, validate, sprintController.listByProject);

// Tickets under project
router.post("/:projectId/tickets", createTicketValidator, validate, ticketController.create);
router.get("/:projectId/tickets", getTicketsQueryValidator, validate, ticketController.listByProject);

export default router;
