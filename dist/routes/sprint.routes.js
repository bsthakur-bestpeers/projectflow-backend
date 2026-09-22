"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sprint_controller_1 = require("../controllers/sprint.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const sprint_validator_1 = require("../validators/sprint.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/:sprintId", sprint_validator_1.sprintIdParamValidator, validate_middleware_1.validate, sprint_controller_1.sprintController.getById);
router.patch("/:sprintId", sprint_validator_1.updateSprintValidator, validate_middleware_1.validate, sprint_controller_1.sprintController.update);
router.delete("/:sprintId", sprint_validator_1.sprintIdParamValidator, validate_middleware_1.validate, sprint_controller_1.sprintController.remove);
router.post("/:sprintId/start", sprint_validator_1.sprintIdParamValidator, validate_middleware_1.validate, sprint_controller_1.sprintController.start);
router.post("/:sprintId/complete", sprint_validator_1.sprintIdParamValidator, validate_middleware_1.validate, sprint_controller_1.sprintController.complete);
exports.default = router;
//# sourceMappingURL=sprint.routes.js.map