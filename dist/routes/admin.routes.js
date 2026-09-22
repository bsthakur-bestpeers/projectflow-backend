"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// All admin routes require authentication and ADMIN role
router.use(auth_middleware_1.authenticate, admin_middleware_1.requireAdmin);
router.get("/users", admin_controller_1.adminController.listUsers);
router.post("/users/:id/approve", admin_controller_1.adminController.approveUser);
router.post("/users/:id/reject", admin_controller_1.adminController.rejectUser);
router.patch("/users/:id/role", admin_controller_1.adminController.changeRole);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map