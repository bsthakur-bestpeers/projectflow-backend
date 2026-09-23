"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketController = void 0;
const ticket_service_1 = require("../services/ticket.service");
const app_constants_1 = require("../constants/app.constants");
exports.ticketController = {
    async create(req, res, next) {
        try {
            const projectId = parseInt(req.params.projectId);
            const { title, description, status, priority, estimation, sprintId, assigneeId, authorId } = req.body;
            const ticket = await ticket_service_1.ticketService.createTicket(projectId, req.user.userId, {
                title,
                description,
                status,
                priority,
                estimation,
                sprint_id: sprintId ?? null,
                assignee_id: assigneeId ?? null,
                author_id: authorId ? parseInt(authorId) : req.user.userId,
            });
            res.status(201).json({ success: true, data: ticket });
        }
        catch (error) {
            next(error);
        }
    },
    async listByProject(req, res, next) {
        try {
            const projectId = parseInt(req.params.projectId);
            const { status, priority, assigneeId, sprintId, search, page, limit } = req.query;
            const filter = {
                status: status,
                priority: priority,
                assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
                sprintId: sprintId === "null" ? null : sprintId ? parseInt(sprintId) : undefined,
                search: search,
                page: page ? parseInt(page) : app_constants_1.DEFAULT_PAGE,
                limit: limit ? parseInt(limit) : app_constants_1.DEFAULT_LIMIT,
            };
            const result = await ticket_service_1.ticketService.getTickets(projectId, req.user.userId, filter);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const ticket = await ticket_service_1.ticketService.getTicketById(parseInt(req.params.ticketId), req.user.userId);
            res.json({ success: true, data: ticket });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const { title, description, status, priority, estimation, assigneeId, sprintId, authorId } = req.body;
            const ticket = await ticket_service_1.ticketService.updateTicket(parseInt(req.params.ticketId), req.user.userId, {
                title,
                description,
                status,
                priority,
                estimation,
                assignee_id: assigneeId,
                sprint_id: sprintId,
                author_id: authorId ? parseInt(authorId) : undefined,
            });
            res.json({ success: true, data: ticket });
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await ticket_service_1.ticketService.deleteTicket(parseInt(req.params.ticketId), req.user.userId);
            res.json({ success: true, message: "Ticket deleted successfully." });
        }
        catch (error) {
            next(error);
        }
    },
    async move(req, res, next) {
        try {
            const { status, position, sprintId } = req.body;
            const ticket = await ticket_service_1.ticketService.moveTicket(parseInt(req.params.ticketId), req.user.userId, { status, position, sprintId });
            res.json({ success: true, data: ticket });
        }
        catch (error) {
            next(error);
        }
    },
    async getDashboard(req, res, next) {
        try {
            const data = await ticket_service_1.ticketService.getDashboardData(req.user.userId);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=ticket.controller.js.map