"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
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
};
//# sourceMappingURL=user.controller.js.map