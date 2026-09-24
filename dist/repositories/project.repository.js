"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRepository = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const projectSelect = {
    id: true,
    name: true,
    description: true,
    status: true,
    created_by: true,
    created_at: true,
    updated_at: true,
    owner: {
        select: { id: true, full_name: true, email: true },
    },
    _count: {
        select: { tickets: true, sprints: true, members: true },
    },
};
exports.projectRepository = {
    async createWithOwnerMembership(data) {
        return prisma_1.default.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name: data.name,
                    description: data.description,
                    created_by: data.created_by,
                },
            });
            await tx.userProject.create({
                data: {
                    user_id: data.created_by,
                    project_id: project.id,
                },
            });
            return tx.project.findUniqueOrThrow({
                where: { id: project.id },
                select: projectSelect,
            });
        });
    },
    async findById(id) {
        return prisma_1.default.project.findUnique({
            where: { id },
            select: projectSelect,
        });
    },
    async findByName(name) {
        return prisma_1.default.project.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: "insensitive",
                },
            },
            select: projectSelect,
        });
    },
    async findByMemberUserId(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [projects, total] = await prisma_1.default.$transaction([
            prisma_1.default.project.findMany({
                where: { members: { some: { user_id: userId } } },
                select: projectSelect,
                orderBy: { updated_at: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.default.project.count({
                where: { members: { some: { user_id: userId } } },
            }),
        ]);
        return { projects, total, page, limit };
    },
    async update(id, data) {
        return prisma_1.default.project.update({
            where: { id },
            data,
            select: projectSelect,
        });
    },
    async delete(id) {
        return prisma_1.default.$transaction(async (tx) => {
            await tx.ticket.deleteMany({ where: { project_id: id } });
            await tx.sprint.deleteMany({ where: { project_id: id } });
            await tx.userProject.deleteMany({ where: { project_id: id } });
            return tx.project.delete({ where: { id } });
        });
    },
    async getTicketSummary(projectId) {
        const [backlog, todo, inProgress, inReview, done] = await prisma_1.default.$transaction([
            prisma_1.default.ticket.count({ where: { project_id: projectId, sprint_id: null, status: { not: "DONE" } } }),
            prisma_1.default.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "TODO" } }),
            prisma_1.default.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "IN_PROGRESS" } }),
            prisma_1.default.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "IN_REVIEW" } }),
            prisma_1.default.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "DONE" } }),
        ]);
        const total = backlog + todo + inProgress + inReview + done;
        return {
            total,
            backlog,
            BACKLOG: backlog,
            TODO: todo,
            IN_PROGRESS: inProgress,
            IN_REVIEW: inReview,
            DONE: done,
        };
    },
};
//# sourceMappingURL=project.repository.js.map