import prisma from "../db/prisma";

export interface CreateTicketData {
  project_id: number;
  sprint_id?: number | null;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  estimation?: string | null;
  author_id: number;
  assignee_id?: number | null;
  position?: number;
}

export interface UpdateTicketData {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  estimation?: string | null;
  assignee_id?: number | null;
  author_id?: number;
  sprint_id?: number | null;
  position?: number;
}

export interface MoveTicketData {
  status?: string;
  position?: number;
  sprint_id?: number | null;
}

export interface GetTicketsFilter {
  status?: string;
  priority?: string;
  assigneeId?: number;
  sprintId?: number | null;
  search?: string;
  page?: number;
  limit?: number;
}

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

export const ticketRepository = {
  async create(data: CreateTicketData) {
    // Get the max position in the target column
    const maxPosition = await prisma.ticket.aggregate({
      where: {
        project_id: data.project_id,
        sprint_id: data.sprint_id ?? null,
        status: data.status ?? "TODO",
      },
      _max: { position: true },
    });
    const position = (maxPosition._max.position ?? 0) + 1;

    return prisma.ticket.create({
      data: { ...data, position },
      select: ticketSelect,
    });
  },

  async findById(id: number) {
    return prisma.ticket.findUnique({
      where: { id },
      select: ticketSelect,
    });
  },

  async findByProject(projectId: number, filter: GetTicketsFilter = {}) {
    const { status, priority, assigneeId, search, page = 1, limit = 20 } = filter;
    const sprintId = filter.sprintId;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { project_id: projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assignee_id = assigneeId;
    if (sprintId === null) where.sprint_id = null;
    else if (sprintId !== undefined) where.sprint_id = sprintId;
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [tickets, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        select: ticketSelect,
        orderBy: [{ status: "asc" }, { position: "asc" }],
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);
    return { tickets, total, page, limit };
  },

  async update(id: number, data: UpdateTicketData) {
    return prisma.ticket.update({
      where: { id },
      data,
      select: ticketSelect,
    });
  },

  async delete(id: number) {
    return prisma.ticket.delete({ where: { id } });
  },

  async moveTicket(
    ticketId: number,
    data: MoveTicketData,
    projectId: number
  ) {
    return prisma.$transaction(async (tx) => {
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

  async getRecentlyUpdated(userId: number, limit: number = 10) {
    return prisma.ticket.findMany({
      where: {
        project: {
          OR: [
            { created_by: userId },
            { members: { some: { user_id: userId } } },
          ],
        },
      },
      select: ticketSelect,
      orderBy: { updated_at: "desc" },
      take: limit,
    });
  },

  async getAssignedToUser(userId: number, limit: number = 20) {
    return prisma.ticket.findMany({
      where: {
        assignee_id: userId,
        status: { not: "DONE" },
      },
      select: ticketSelect,
      orderBy: { updated_at: "desc" },
      take: limit,
    });
  },
};
