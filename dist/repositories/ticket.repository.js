"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketRepository = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const ticketSelect = {
    id: true,
    project_id: true,
    sprint_id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    estimation: true,
    author_id: true,
    assignee_id: true,
    position: true,
    created_at: true,
    updated_at: true,
    author: { select: { id: true, full_name: true, email: true } },
    assignee: { select: { id: true, full_name: true, email: true } },
    sprint: { select: { id: true, name: true, status: true, start_date: true, end_date: true } },
};
const fallbackTicketSelect = {
    id: true,
    project_id: true,
    sprint_id: true,
    title: true,
    description: true,
    status: true,
    estimation: true,
    author_id: true,
    assignee_id: true,
    position: true,
    created_at: true,
    updated_at: true,
    author: { select: { id: true, full_name: true, email: true } },
    assignee: { select: { id: true, full_name: true, email: true } },
    sprint: { select: { id: true, name: true, status: true, start_date: true, end_date: true } },
};
exports.ticketRepository = {
    async create(data) {
        // Get the max position in the target column
        const maxPosition = await prisma_1.default.ticket.aggregate({
            where: {
                project_id: data.project_id,
                sprint_id: data.sprint_id ?? null,
                status: data.status ?? "TODO",
            },
            _max: { position: true },
        });
        const position = (maxPosition._max.position ?? 0) + 1;
        try {
            return await prisma_1.default.ticket.create({
                data: { ...data, position },
                select: ticketSelect,
            });
        }
        catch {
            const { priority: _p, ...fallbackData } = data;
            const created = await prisma_1.default.ticket.create({
                data: { ...fallbackData, position },
                select: fallbackTicketSelect,
            });
            return { ...created, priority: data.priority ?? "MEDIUM" };
        }
    },
    async findById(id) {
        try {
            return await prisma_1.default.ticket.findUnique({
                where: { id },
                select: ticketSelect,
            });
        }
        catch {
            const ticket = await prisma_1.default.ticket.findUnique({
                where: { id },
                select: fallbackTicketSelect,
            });
            return ticket ? { ...ticket, priority: "MEDIUM" } : null;
        }
    },
    async findByProject(projectId, filter = {}) {
        const { status, priority, assigneeId, search, page = 1, limit = 20 } = filter;
        const sprintId = filter.sprintId;
        const skip = (page - 1) * limit;
        const where = { project_id: projectId };
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (assigneeId)
            where.assignee_id = assigneeId;
        if (sprintId === null)
            where.sprint_id = null;
        else if (sprintId !== undefined)
            where.sprint_id = sprintId;
        if (search) {
            where.title = { contains: search, mode: "insensitive" };
        }
        try {
            const [tickets, total] = await Promise.all([
                prisma_1.default.ticket.findMany({
                    where,
                    select: ticketSelect,
                    orderBy: [{ status: "asc" }, { position: "asc" }],
                    skip,
                    take: limit,
                }),
                prisma_1.default.ticket.count({ where }),
            ]);
            return { tickets, total, page, limit };
        }
        catch (err) {
            console.warn("Primary findByProject failed, attempting auto-repair/fallback:", err?.message);
            try {
                await prisma_1.default.$executeRawUnsafe(`ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'MEDIUM';`);
                await prisma_1.default.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "tickets_priority_idx" ON "tickets"("priority");`);
                const [tickets, total] = await Promise.all([
                    prisma_1.default.ticket.findMany({
                        where,
                        select: ticketSelect,
                        orderBy: [{ status: "asc" }, { position: "asc" }],
                        skip,
                        take: limit,
                    }),
                    prisma_1.default.ticket.count({ where }),
                ]);
                return { tickets, total, page, limit };
            }
            catch {
                const fallbackWhere = { ...where };
                delete fallbackWhere.priority;
                const [tickets, total] = await Promise.all([
                    prisma_1.default.ticket.findMany({
                        where: fallbackWhere,
                        select: fallbackTicketSelect,
                        orderBy: [{ status: "asc" }, { position: "asc" }],
                        skip,
                        take: limit,
                    }),
                    prisma_1.default.ticket.count({ where: fallbackWhere }),
                ]);
                const mappedTickets = tickets.map((t) => ({
                    ...t,
                    priority: "MEDIUM",
                }));
                return { tickets: mappedTickets, total, page, limit };
            }
        }
    },
    async update(id, data) {
        return prisma_1.default.ticket.update({
            where: { id },
            data,
            select: ticketSelect,
        });
    },
    async delete(id) {
        return prisma_1.default.ticket.delete({ where: { id } });
    },
    async moveTicket(ticketId, data, projectId) {
        return prisma_1.default.$transaction(async (tx) => {
            const ticket = await tx.ticket.findUniqueOrThrow({
                where: { id: ticketId },
            });
            const newStatus = data.status ?? ticket.status;
            const newSprintId = data.sprint_id !== undefined ? data.sprint_id : ticket.sprint_id;
            const newPosition = data.position ?? 0;
            // Shift existing tickets to make room
            await tx.ticket.updateMany({
                where: {
                    project_id: projectId,
                    sprint_id: newSprintId,
                    status: newStatus,
                    id: { not: ticketId },
                    position: { gte: newPosition },
                },
                data: { position: { increment: 1 } },
            });
            return tx.ticket.update({
                where: { id: ticketId },
                data: {
                    status: newStatus,
                    sprint_id: newSprintId,
                    position: newPosition,
                },
                select: ticketSelect,
            });
        });
    },
    async getRecentlyUpdated(userId, limit = 10) {
        const where = {
            project: {
                OR: [
                    { created_by: userId },
                    { members: { some: { user_id: userId } } },
                ],
            },
        };
        try {
            return await prisma_1.default.ticket.findMany({
                where,
                select: ticketSelect,
                orderBy: { updated_at: "desc" },
                take: limit,
            });
        }
        catch {
            const tickets = await prisma_1.default.ticket.findMany({
                where,
                select: fallbackTicketSelect,
                orderBy: { updated_at: "desc" },
                take: limit,
            });
            return tickets.map((t) => ({ ...t, priority: "MEDIUM" }));
        }
    },
    async getAssignedToUser(userId, limit = 20) {
        const where = {
            assignee_id: userId,
            status: { not: "DONE" },
        };
        try {
            return await prisma_1.default.ticket.findMany({
                where,
                select: ticketSelect,
                orderBy: { updated_at: "desc" },
                take: limit,
            });
        }
        catch {
            const tickets = await prisma_1.default.ticket.findMany({
                where,
                select: fallbackTicketSelect,
                orderBy: { updated_at: "desc" },
                take: limit,
            });
            return tickets.map((t) => ({ ...t, priority: "MEDIUM" }));
        }
    },
};
//# sourceMappingURL=ticket.repository.js.map