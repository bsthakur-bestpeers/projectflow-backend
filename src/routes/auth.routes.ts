import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerValidator, loginValidator } from "../validators/auth.validator";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

const router = Router();

router.post("/register", authLimiter, registerValidator, validate, authController.register);
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);

export default router;
