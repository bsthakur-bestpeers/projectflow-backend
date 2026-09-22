"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberRepository = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
exports.memberRepository = {
    async findMembership(userId, projectId) {
        return prisma_1.default.userProject.findUnique({
            where: { user_id_project_id: { user_id: userId, project_id: projectId } },
        });
    },
    async addMember(userId, projectId) {
        return prisma_1.default.userProject.create({
            data: { user_id: userId, project_id: projectId },
            include: {
                user: { select: { id: true, full_name: true, email: true } },
            },
        });
    },
    async removeMember(userId, projectId) {
        return prisma_1.default.userProject.delete({
            where: { user_id_project_id: { user_id: userId, project_id: projectId } },
        });
    },
    async getProjectMembers(projectId) {
        return prisma_1.default.userProject.findMany({
            where: { project_id: projectId },
            include: {
                user: {
                    select: { id: true, full_name: true, email: true, is_active: true },
                },
            },
            orderBy: { created_at: "asc" },
        });
    },
};
//# sourceMappingURL=member.repository.js.map