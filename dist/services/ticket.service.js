"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketService = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const ticket_repository_1 = require("../repositories/ticket.repository");
const project_repository_1 = require("../repositories/project.repository");
const member_repository_1 = require("../repositories/member.repository");
const sprint_repository_1 = require("../repositories/sprint.repository");
const user_repository_1 = require("../repositories/user.repository");
const error_middleware_1 = require("../middleware/error.middleware");
const ALLOWED_HTML_TAGS = [
    "b", "i", "em", "strong", "a", "p", "ul", "ol", "li",
    "h1", "h2", "h3", "blockquote", "code", "pre", "br", "s",
];
function sanitizeDescription(html) {
    return (0, sanitize_html_1.default)(html, {
        allowedTags: ALLOWED_HTML_TAGS,
        allowedAttributes: { a: ["href", "target"] },
    });
}
async function assertProjectMember(projectId, userId) {
    const project = await project_repository_1.projectRepository.findById(projectId);
    if (!project)
        throw (0, error_middleware_1.createError)("Project not found.", 404);
    const membership = await member_repository_1.memberRepository.findMembership(userId, projectId);
    const isOwner = project.created_by === userId;
    if (!membership && !isOwner) {
        throw (0, error_middleware_1.createError)("You do not have access to this project.", 403);
    }
    return project;
}
exports.ticketService = {
    async createTicket(projectId, userId, data) {
        const project = await assertProjectMember(projectId, userId);
        const authorId = data.author_id ?? userId;
        const authorUser = await user_repository_1.userRepository.findById(authorId);
        if (!authorUser || !authorUser.is_active) {
            throw (0, error_middleware_1.createError)("Author user not found or inactive.", 400);
        }
        // Ensure author has membership
        if (authorId !== project.created_by) {
            const authorMembership = await member_repository_1.memberRepository.findMembership(authorId, projectId);
            if (!authorMembership) {
                await member_repository_1.memberRepository.addMember(authorId, projectId).catch(() => { });
            }
        }
        // Validate assignee
        if (data.assignee_id) {
            const assigneeUser = await user_repository_1.userRepository.findById(data.assignee_id);
            if (!assigneeUser || !assigneeUser.is_active) {
                throw (0, error_middleware_1.createError)("Assignee user not found or inactive.", 400);
            }
            if (data.assignee_id !== project.created_by) {
                const assigneeMembership = await member_repository_1.memberRepository.findMembership(data.assignee_id, projectId);
                if (!assigneeMembership) {
                    await member_repository_1.memberRepository.addMember(data.assignee_id, projectId).catch(() => { });
                }
            }
        }
        // Validate sprint belongs to this project if provided
        if (data.sprint_id !== undefined && data.sprint_id !== null) {
            const sprint = await sprint_repository_1.sprintRepository.findById(data.sprint_id);
            if (!sprint || sprint.project_id !== projectId) {
                throw (0, error_middleware_1.createError)("Sprint does not belong to this project.", 400);
            }
        }
        const description = data.description ? sanitizeDescription(data.description) : undefined;
        return ticket_repository_1.ticketRepository.create({ ...data, description, project_id: projectId, author_id: authorId });
    },
    async getTickets(projectId, userId, filter) {
        await assertProjectMember(projectId, userId);
        return ticket_repository_1.ticketRepository.findByProject(projectId, filter);
    },
    async getTicketById(ticketId, userId) {
        const ticket = await ticket_repository_1.ticketRepository.findById(ticketId);
        if (!ticket)
            throw (0, error_middleware_1.createError)("Ticket not found.", 404);
        await assertProjectMember(ticket.project_id, userId);
        return ticket;
    },
    async updateTicket(ticketId, userId, data) {
        const ticket = await ticket_repository_1.ticketRepository.findById(ticketId);
        if (!ticket)
            throw (0, error_middleware_1.createError)("Ticket not found.", 404);
        const project = await assertProjectMember(ticket.project_id, userId);
        // Validate author if being changed
        if (data.author_id !== undefined && data.author_id !== null) {
            const authorUser = await user_repository_1.userRepository.findById(data.author_id);
            if (!authorUser || !authorUser.is_active) {
                throw (0, error_middleware_1.createError)("Author user not found or inactive.", 400);
            }
            if (data.author_id !== project.created_by) {
                const authorMembership = await member_repository_1.memberRepository.findMembership(data.author_id, ticket.project_id);
                if (!authorMembership) {
                    await member_repository_1.memberRepository.addMember(data.author_id, ticket.project_id).catch(() => { });
                }
            }
        }
        // Validate assignee if being changed
        if (data.assignee_id !== undefined && data.assignee_id !== null) {
            const assigneeUser = await user_repository_1.userRepository.findById(data.assignee_id);
            if (!assigneeUser || !assigneeUser.is_active) {
                throw (0, error_middleware_1.createError)("Assignee user not found or inactive.", 400);
            }
            if (data.assignee_id !== project.created_by) {
                const assigneeMembership = await member_repository_1.memberRepository.findMembership(data.assignee_id, ticket.project_id);
                if (!assigneeMembership) {
                    await member_repository_1.memberRepository.addMember(data.assignee_id, ticket.project_id).catch(() => { });
                }
            }
        }
        // Validate sprint if being changed
        if (data.sprint_id !== undefined && data.sprint_id !== null) {
            const sprint = await sprint_repository_1.sprintRepository.findById(data.sprint_id);
            if (!sprint || sprint.project_id !== ticket.project_id) {
                throw (0, error_middleware_1.createError)("Sprint does not belong to this project.", 400);
            }
        }
        const description = data.description !== undefined && data.description !== null
            ? sanitizeDescription(data.description)
            : data.description;
        return ticket_repository_1.ticketRepository.update(ticketId, { ...data, description });
    },
    async deleteTicket(ticketId, userId) {
        const ticket = await ticket_repository_1.ticketRepository.findById(ticketId);
        if (!ticket)
            throw (0, error_middleware_1.createError)("Ticket not found.", 404);
        await assertProjectMember(ticket.project_id, userId);
        return ticket_repository_1.ticketRepository.delete(ticketId);
    },
    async moveTicket(ticketId, userId, data) {
        const ticket = await ticket_repository_1.ticketRepository.findById(ticketId);
        if (!ticket)
            throw (0, error_middleware_1.createError)("Ticket not found.", 404);
        await assertProjectMember(ticket.project_id, userId);
        // Validate target sprint
        if (data.sprintId !== undefined && data.sprintId !== null) {
            const sprint = await sprint_repository_1.sprintRepository.findById(data.sprintId);
            if (!sprint || sprint.project_id !== ticket.project_id) {
                throw (0, error_middleware_1.createError)("Sprint does not belong to this project.", 400);
            }
        }
        return ticket_repository_1.ticketRepository.moveTicket(ticketId, {
            status: data.status,
            position: data.position,
            sprint_id: data.sprintId,
        }, ticket.project_id);
    },
    async getDashboardData(userId) {
        const [assignedTickets, recentTickets] = await Promise.all([
            ticket_repository_1.ticketRepository.getAssignedToUser(userId, 10),
            ticket_repository_1.ticketRepository.getRecentlyUpdated(userId, 10),
        ]);
        return { assignedTickets, recentTickets };
    },
};
//# sourceMappingURL=ticket.service.js.map