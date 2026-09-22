"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const app_constants_1 = require("../constants/app.constants");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax"),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
exports.authController = {
    async register(req, res, next) {
        try {
            const { full_name, email, password } = req.body;
            const user = await auth_service_1.authService.register(full_name, email, password);
            res.status(201).json({ success: true, message: "Account created successfully.", data: user });
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, token } = await auth_service_1.authService.login(email, password);
            res.cookie(app_constants_1.JWT_COOKIE_NAME, token, COOKIE_OPTIONS);
            res.json({ success: true, message: "Logged in successfully.", data: { user, token } });
        }
        catch (error) {
            next(error);
        }
    },
    async getMe(req, res, next) {
        try {
            const user = await auth_service_1.authService.getMe(req.user.userId);
            res.json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    },
    async logout(req, res) {
        res.clearCookie(app_constants_1.JWT_COOKIE_NAME);
        res.json({ success: true, message: "Logged out successfully." });
    },
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await auth_service_1.authService.forgotPassword(email);
            res.json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }
        catch (error) {
            next(error);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            await auth_service_1.authService.resetPassword(token, password);
            res.json({ success: true, message: "Password has been successfully reset." });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map