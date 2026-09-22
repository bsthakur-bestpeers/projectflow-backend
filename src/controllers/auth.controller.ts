import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { JWT_COOKIE_NAME } from "../constants/app.constants";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { full_name, email, password } = req.body;
      const user = await authService.register(full_name, email, password);
      res.status(201).json({ success: true, message: "Account created successfully.", data: user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.cookie(JWT_COOKIE_NAME, token, COOKIE_OPTIONS);
      res.json({ success: true, message: "Logged in successfully.", data: { user, token } });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie(JWT_COOKIE_NAME);
    res.json({ success: true, message: "Logged out successfully." });
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.json({ 
        success: true, 
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.json({ success: true, message: "Password has been successfully reset." });
    } catch (error) {
      next(error);
    }
  },
};
