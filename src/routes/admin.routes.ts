import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, requireAdmin);

router.get("/users", adminController.listUsers);
router.post("/users/:id/approve", adminController.approveUser);
router.post("/users/:id/reject", adminController.rejectUser);
router.patch("/users/:id/role", adminController.changeRole);

export default router;
