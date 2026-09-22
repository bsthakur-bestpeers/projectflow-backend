"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const error_middleware_1 = require("./error.middleware");
const user_repository_1 = require("../repositories/user.repository");
const requireAdmin = async (req, _res, next) => {
    try {
        if (!req.user) {
            throw (0, error_middleware_1.createError)("Authentication required.", 401);
        }
        // Check role in JWT or check DB directly for real-time validity
        if (req.user.role === "ADMIN") {
            return next();
        }
        const user = await user_repository_1.userRepository.findById(req.user.userId);
        if (!user || user.role !== "ADMIN") {
            throw (0, error_middleware_1.createError)("Access denied. Admin role required.", 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin.middleware.js.map