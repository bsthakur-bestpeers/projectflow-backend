import sanitizeHtml from "sanitize-html";
import { ticketRepository, CreateTicketData, UpdateTicketData, GetTicketsFilter } from "../repositories/ticket.repository";
import { projectRepository } from "../repositories/project.repository";
import { memberRepository } from "../repositories/member.repository";
import { sprintRepository } from "../repositories/sprint.repository";
import { userRepository } from "../repositories/user.repository";
import { createError } from "../middleware/error.middleware";

const ALLOWED_HTML_TAGS = [
  "b", "i", "em", "strong", "a", "p", "ul", "ol", "li",
  "h1", "h2", "h3", "blockquote", "code", "pre", "br", "s",
  "div", "span", "img",
];

function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_HTML_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel", "download"],
      img: ["src", "alt", "width", "height", "class"],
      div: ["data-attachments", "style", "class"],
      span: ["style", "class"],
      "*": ["data-*"],
    },
    allowedSchemes: ["http", "https", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
  });
}

async function assertProjectMember(projectId: number, userId: number) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw createError("Project not found.", 404);
  const membership = await memberRepository.findMembership(userId, projectId);
  const isOwner = project.created_by === userId;
  if (!membership && !isOwner) {
    throw createError("You do not have access to this project.", 403);
  }
  return project;
}

export const ticketService = {
  async createTicket(projectId: number, userId: number, data: Omit<CreateTicketData, "project_id">) {
    const project = await assertProjectMember(projectId, userId);

    const authorId = data.author_id ?? userId;
    const authorUser = await userRepository.findById(authorId);
    if (!authorUser || !authorUser.is_active) {
      throw createError("Author user not found or inactive.", 400);
    }
    // Ensure author has membership
    if (authorId !== project.created_by) {
      const authorMembership = await memberRepository.findMembership(authorId, projectId);
      if (!authorMembership) {
        await memberRepository.addMember(authorId, projectId).catch(() => {});
      }
    }

    // Validate assignee
    if (data.assignee_id) {
      const assigneeUser = await userRepository.findById(data.assignee_id);
      if (!assigneeUser || !assigneeUser.is_active) {
        throw createError("Assignee user not found or inactive.", 400);
      }
      if (data.assignee_id !== project.created_by) {
        const assigneeMembership = await memberRepository.findMembership(data.assignee_id, projectId);
        if (!assigneeMembership) {
          await memberRepository.addMember(data.assignee_id, projectId).catch(() => {});
        }
      }
    }

    // Validate sprint belongs to this project if provided
    if (data.sprint_id !== undefined && data.sprint_id !== null) {
      const sprint = await sprintRepository.findById(data.sprint_id);
      if (!sprint || sprint.project_id !== projectId) {
        throw createError("Sprint does not belong to this project.", 400);
      }
    }

    const description = data.description ? sanitizeDescription(data.description) : undefined;
    return ticketRepository.create({ ...data, description, project_id: projectId, author_id: authorId });
  },

  async getTickets(projectId: number, userId: number, filter: GetTicketsFilter) {
    await assertProjectMember(projectId, userId);
    return ticketRepository.findByProject(projectId, filter);
  },

  async getTicketById(ticketId: number, userId: number) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw createError("Ticket not found.", 404);
    await assertProjectMember(ticket.project_id, userId);
    return ticket;
  },

  async updateTicket(ticketId: number, userId: number, data: UpdateTicketData) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw createError("Ticket not found.", 404);
    const project = await assertProjectMember(ticket.project_id, userId);

    // Validate author if being changed
    if (data.author_id !== undefined && data.author_id !== null) {
      const authorUser = await userRepository.findById(data.author_id);
      if (!authorUser || !authorUser.is_active) {
        throw createError("Author user not found or inactive.", 400);
      }
      if (data.author_id !== project.created_by) {
        const authorMembership = await memberRepository.findMembership(data.author_id, ticket.project_id);
        if (!authorMembership) {
          await memberRepository.addMember(data.author_id, ticket.project_id).catch(() => {});
        }
      }
    }

    // Validate assignee if being changed
    if (data.assignee_id !== undefined && data.assignee_id !== null) {
      const assigneeUser = await userRepository.findById(data.assignee_id);
      if (!assigneeUser || !assigneeUser.is_active) {
        throw createError("Assignee user not found or inactive.", 400);
      }
      if (data.assignee_id !== project.created_by) {
        const assigneeMembership = await memberRepository.findMembership(data.assignee_id, ticket.project_id);
        if (!assigneeMembership) {
          await memberRepository.addMember(data.assignee_id, ticket.project_id).catch(() => {});
        }
      }
    }

    // Validate sprint if being changed
    if (data.sprint_id !== undefined && data.sprint_id !== null) {
      const sprint = await sprintRepository.findById(data.sprint_id);
      if (!sprint || sprint.project_id !== ticket.project_id) {
        throw createError("Sprint does not belong to this project.", 400);
      }
    }

    const description =
      data.description !== undefined && data.description !== null
        ? sanitizeDescription(data.description)
        : data.description;

    return ticketRepository.update(ticketId, { ...data, description });
  },

  async deleteTicket(ticketId: number, userId: number) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw createError("Ticket not found.", 404);
    await assertProjectMember(ticket.project_id, userId);

    return ticketRepository.delete(ticketId);
  },

  async moveTicket(ticketId: number, userId: number, data: { status?: string; position?: number; sprintId?: number | null }) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw createError("Ticket not found.", 404);
    await assertProjectMember(ticket.project_id, userId);

    // Validate target sprint
    if (data.sprintId !== undefined && data.sprintId !== null) {
      const sprint = await sprintRepository.findById(data.sprintId);
      if (!sprint || sprint.project_id !== ticket.project_id) {
        throw createError("Sprint does not belong to this project.", 400);
      }
    }

    return ticketRepository.moveTicket(
      ticketId,
      {
        status: data.status,
        position: data.position,
        sprint_id: data.sprintId,
      },
      ticket.project_id
    );
  },

  async getDashboardData(userId: number) {
    const [assignedTickets, recentTickets] = await Promise.all([
      ticketRepository.getAssignedToUser(userId, 10),
      ticketRepository.getRecentlyUpdated(userId, 10),
    ]);
    return { assignedTickets, recentTickets };
  },
};
