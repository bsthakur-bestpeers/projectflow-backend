"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("./error.middleware");
const app_constants_1 = require("../constants/app.constants");
const authenticate = (req, _res, next) => {
    try {
        // Try cookie first, then Authorization header
        const token = req.cookies?.[app_constants_1.JWT_COOKIE_NAME] ||
            req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            throw (0, error_middleware_1.createError)("Authentication required. Please log in.", 401);
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next((0, error_middleware_1.createError)("Invalid or expired token. Please log in again.", 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map