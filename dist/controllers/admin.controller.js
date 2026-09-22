"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const user_repository_1 = require("../repositories/user.repository");
const error_middleware_1 = require("../middleware/error.middleware");
exports.adminController = {
    async listUsers(req, res, next) {
        try {
            const status = req.query.status;
            const role = req.query.role;
            const users = await user_repository_1.userRepository.findAllUsers({
                approval_status: status,
                role,
            });
            res.json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async approveUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId))
                throw (0, error_middleware_1.createError)("Invalid user ID.", 400);
            const user = await user_repository_1.userRepository.findById(userId);
            if (!user)
                throw (0, error_middleware_1.createError)("User not found.", 404);
            const updated = await user_repository_1.userRepository.updateApprovalStatus(userId, "APPROVED", true);
            res.json({
                success: true,
                data: updated,
                message: `User ${updated.full_name} has been approved successfully.`,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async rejectUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId))
                throw (0, error_middleware_1.createError)("Invalid user ID.", 400);
            const user = await user_repository_1.userRepository.findById(userId);
            if (!user)
                throw (0, error_middleware_1.createError)("User not found.", 404);
            // Prevent rejecting self
            if (req.user?.userId === userId) {
                throw (0, error_middleware_1.createError)("You cannot reject your own account.", 400);
            }
            const updated = await user_repository_1.userRepository.updateApprovalStatus(userId, "REJECTED", false);
            res.json({
                success: true,
                data: updated,
                message: `User ${updated.full_name} has been rejected.`,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async changeRole(req, res, next) {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId))
                throw (0, error_middleware_1.createError)("Invalid user ID.", 400);
            const { role } = req.body;
            if (!role || !["ADMIN", "USER"].includes(role)) {
                throw (0, error_middleware_1.createError)("Invalid role. Allowed values: ADMIN, USER.", 400);
            }
            if (req.user?.userId === userId && role !== "ADMIN") {
                throw (0, error_middleware_1.createError)("You cannot demote yourself from ADMIN.", 400);
            }
            const updated = await user_repository_1.userRepository.updateRole(userId, role);
            res.json({
                success: true,
                data: updated,
                message: `Role for ${updated.full_name} updated to ${role}.`,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=admin.controller.js.map