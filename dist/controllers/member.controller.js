"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberController = void 0;
const member_service_1 = require("../services/member.service");
exports.memberController = {
    async list(req, res, next) {
        try {
            const members = await member_service_1.memberService.getMembers(parseInt(req.params.projectId), req.user.userId);
            res.json({ success: true, data: members });
        }
        catch (error) {
            next(error);
        }
    },
    async add(req, res, next) {
        try {
            const member = await member_service_1.memberService.addMember(parseInt(req.params.projectId), req.user.userId, req.body.email);
            res.status(201).json({ success: true, data: member });
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await member_service_1.memberService.removeMember(parseInt(req.params.projectId), req.user.userId, parseInt(req.params.userId));
            res.json({ success: true, message: "Member removed successfully." });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=member.controller.js.map