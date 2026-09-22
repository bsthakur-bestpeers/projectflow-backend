"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});
const router = (0, express_1.Router)();
router.post("/register", authLimiter, auth_validator_1.registerValidator, validate_middleware_1.validate, auth_controller_1.authController.register);
router.post("/login", authLimiter, auth_validator_1.loginValidator, validate_middleware_1.validate, auth_controller_1.authController.login);
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.authController.getMe);
router.post("/logout", auth_middleware_1.authenticate, auth_controller_1.authController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map