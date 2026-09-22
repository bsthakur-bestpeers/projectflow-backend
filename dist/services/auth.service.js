"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../repositories/user.repository");
const error_middleware_1 = require("../middleware/error.middleware");
exports.authService = {
    async register(full_name, email, password) {
        const existing = await user_repository_1.userRepository.findByEmail(email);
        if (existing) {
            throw (0, error_middleware_1.createError)("An account with this email already exists.", 409);
        }
        const password_hash = await argon2_1.default.hash(password);
        // Check if this is the first user registered in the system
        const count = await user_repository_1.userRepository.countTotal();
        const isFirstUser = count === 0;
        const user = await user_repository_1.userRepository.create({
            full_name,
            email,
            password_hash,
            role: isFirstUser ? "ADMIN" : "USER",
            approval_status: isFirstUser ? "APPROVED" : "PENDING",
            is_active: isFirstUser,
        });
        return user;
    },
    async login(email, password) {
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            throw (0, error_middleware_1.createError)("Invalid email or password.", 401);
        }
        const valid = await argon2_1.default.verify(user.password_hash, password);
        if (!valid) {
            throw (0, error_middleware_1.createError)("Invalid email or password.", 401);
        }
        if (user.approval_status === "PENDING") {
            throw (0, error_middleware_1.createError)("Your account is pending admin approval. Please wait for an administrator to approve your registration.", 403);
        }
        if (user.approval_status === "REJECTED") {
            throw (0, error_middleware_1.createError)("Your account registration was not approved. Please contact an administrator.", 403);
        }
        if (!user.is_active) {
            throw (0, error_middleware_1.createError)("Your account is inactive. Please contact an administrator.", 403);
        }
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET not configured");
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, secret, { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" });
        const { password_hash: _, ...safeUser } = user;
        return { user: safeUser, token };
    },
    async getMe(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw (0, error_middleware_1.createError)("User not found.", 404);
        }
        return user;
    },
};
//# sourceMappingURL=auth.service.js.map