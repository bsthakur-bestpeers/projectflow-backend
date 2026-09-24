"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const member_controller_1 = require("../controllers/member.controller");
const sprint_controller_1 = require("../controllers/sprint.controller");
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const project_validator_1 = require("../validators/project.validator");
const auth_validator_1 = require("../validators/auth.validator");
const sprint_validator_1 = require("../validators/sprint.validator");
const ticket_validator_1 = require("../validators/ticket.validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Ensure uploads directory exists
const uploadDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const excelUpload = (0, multer_1.default)({
    dest: uploadDir,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});
// All project routes require authentication
router.use(auth_middleware_1.authenticate);
// Sample template download (must be before :projectId)
router.get("/sample-template", project_controller_1.projectController.downloadSampleTemplate);
// Project Import (creates a new project from XLSX)
router.post("/import", excelUpload.single("file"), project_controller_1.projectController.importXlsx);
router.post("/", project_validator_1.createProjectValidator, validate_middleware_1.validate, project_controller_1.projectController.create);
router.get("/", project_validator_1.getProjectsQueryValidator, validate_middleware_1.validate, project_controller_1.projectController.list);
// Project Export (streams XLSX file)
router.get("/:projectId/export", project_validator_1.projectIdParamValidator, validate_middleware_1.validate, project_controller_1.projectController.exportXlsx);
// Import into existing project
router.post("/:projectId/import", project_validator_1.projectIdParamValidator, validate_middleware_1.validate, excelUpload.single("file"), project_controller_1.projectController.importIntoProject);
router.get("/:projectId", project_validator_1.projectIdParamValidator, validate_middleware_1.validate, project_controller_1.projectController.getById);
router.get("/:projectId/summary", project_validator_1.projectIdParamValidator, validate_middleware_1.validate, project_controller_1.projectController.getSummary);
router.patch("/:projectId", project_validator_1.updateProjectValidator, validate_middleware_1.validate, project_controller_1.projectController.update);
router.delete("/:projectId", project_validator_1.projectIdParamValidator, validate_middleware_1.validate, project_controller_1.projectController.remove);
// Members
router.get("/:projectId/members", project_validator_1.projectIdParamValidator, validate_middleware_1.validate, member_controller_1.memberController.list);
router.post("/:projectId/members", auth_validator_1.addMemberValidator, validate_middleware_1.validate, member_controller_1.memberController.add);
router.delete("/:projectId/members/:userId", auth_validator_1.removeMemberValidator, validate_middleware_1.validate, member_controller_1.memberController.remove);
// Sprints under project
router.post("/:projectId/sprints", sprint_validator_1.createSprintValidator, validate_middleware_1.validate, sprint_controller_1.sprintController.create);
router.get("/:projectId/sprints", project_validator_1.projectIdParamValidator, validate_middleware_1.validate, sprint_controller_1.sprintController.listByProject);
// Tickets under project
router.post("/:projectId/tickets", ticket_validator_1.createTicketValidator, validate_middleware_1.validate, ticket_controller_1.ticketController.create);
router.get("/:projectId/tickets", ticket_validator_1.getTicketsQueryValidator, validate_middleware_1.validate, ticket_controller_1.ticketController.listByProject);
exports.default = router;
//# sourceMappingURL=project.routes.js.map