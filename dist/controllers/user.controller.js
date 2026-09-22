"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const argon2_1 = __importDefault(require("argon2"));
const user_repository_1 = require("../repositories/user.repository");
exports.userController = {
    async list(req, res, next) {
        try {
            const users = await user_repository_1.userRepository.findAllActive();
            res.json({
                success: true,
                data: users,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async updateProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const { full_name, password } = req.body;
            const updateData = {};
            if (full_name) {
                updateData.full_name = full_name;
            }
            if (password) {
                updateData.password_hash = await argon2_1.default.hash(password);
            }
            const updatedUser = await user_repository_1.userRepository.updateProfile(userId, updateData);
            res.json({
                success: true,
                data: updatedUser,
                message: "Profile updated successfully.",
            });
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=user.controller.js.map