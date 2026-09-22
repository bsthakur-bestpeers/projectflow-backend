"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintRepository = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const sprintSelect = {
    id: true,
    project_id: true,
    name: true,
    start_date: true,
    end_date: true,
    status: true,
    created_at: true,
    updated_at: true,
    _count: { select: { tickets: true } },
};
exports.sprintRepository = {
    async create(data) {
        return prisma_1.default.sprint.create({
            data: {
                project_id: data.project_id,
                name: data.name ?? null,
                start_date: data.start_date,
                end_date: data.end_date,
            },
            select: sprintSelect,
        });
    },
    async findById(id) {
        return prisma_1.default.sprint.findUnique({
            where: { id },
            select: sprintSelect,
        });
    },
    async findByProject(projectId) {
        return prisma_1.default.sprint.findMany({
            where: { project_id: projectId },
            select: sprintSelect,
            orderBy: [{ id: "desc" }],
        });
    },
    async findActiveByProject(projectId) {
        return prisma_1.default.sprint.findFirst({
            where: { project_id: projectId, status: "ACTIVE" },
            select: sprintSelect,
        });
    },
    async findOverlapping(projectId, startDate, endDate, excludeSprintId) {
        return prisma_1.default.sprint.findFirst({
            where: {
                project_id: projectId,
                id: excludeSprintId ? { not: excludeSprintId } : undefined,
                status: { not: "COMPLETED" },
                start_date: { lte: endDate },
                end_date: { gte: startDate },
            },
        });
    },
    async countByProject(projectId) {
        return prisma_1.default.sprint.count({ where: { project_id: projectId } });
    },
    async findLatestByEndDate(projectId) {
        return prisma_1.default.sprint.findFirst({
            where: { project_id: projectId },
            orderBy: { end_date: "desc" },
            select: sprintSelect,
        });
    },
    async update(id, data) {
        return prisma_1.default.sprint.update({
            where: { id },
            data,
            select: sprintSelect,
        });
    },
    async delete(id) {
        return prisma_1.default.$transaction(async (tx) => {
            await tx.ticket.updateMany({
                where: { sprint_id: id },
                data: { sprint_id: null },
            });
            return tx.sprint.delete({ where: { id } });
        });
    },
    async startSprint(sprintId, startDate, endDate) {
        const data = {
            status: "ACTIVE",
        };
        if (startDate)
            data.start_date = startDate;
        if (endDate)
            data.end_date = endDate;
        return prisma_1.default.sprint.update({
            where: { id: sprintId },
            data,
            select: sprintSelect,
        });
    },
    async completeSprint(sprintId, endDate) {
        const data = {
            status: "COMPLETED",
        };
        if (endDate)
            data.end_date = endDate;
        return prisma_1.default.sprint.update({
            where: { id: sprintId },
            data,
            select: sprintSelect,
        });
    },
    async cancelSprint(sprintId) {
        return prisma_1.default.$transaction(async (tx) => {
            // Move any incomplete tickets back to the backlog
            await tx.ticket.updateMany({
                where: {
                    sprint_id: sprintId,
                    status: { not: "DONE" },
                },
                data: { sprint_id: null },
            });
            return tx.sprint.update({
                where: { id: sprintId },
                data: { status: "CANCELLED" },
                select: sprintSelect,
            });
        });
    },
};
//# sourceMappingURL=sprint.repository.js.map