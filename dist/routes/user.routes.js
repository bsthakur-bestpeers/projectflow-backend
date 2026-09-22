"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", user_controller_1.userController.list);
router.put("/profile", user_controller_1.userController.updateProfile);
exports.default = router;
//# sourceMappingURL=user.routes.js.map