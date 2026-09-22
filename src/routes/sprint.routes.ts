import { Router } from "express";
import { sprintController } from "../controllers/sprint.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateSprintValidator, sprintIdParamValidator } from "../validators/sprint.validator";

const router = Router();
router.use(authenticate);

router.get("/:sprintId", sprintIdParamValidator, validate, sprintController.getById);
router.patch("/:sprintId", updateSprintValidator, validate, sprintController.update);
router.delete("/:sprintId", sprintIdParamValidator, validate, sprintController.remove);
router.post("/:sprintId/start", sprintIdParamValidator, validate, sprintController.start);
router.post("/:sprintId/complete", sprintIdParamValidator, validate, sprintController.complete);

export default router;
