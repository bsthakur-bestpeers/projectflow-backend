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

    try {
      return await prisma.ticket.create({
        data: { ...data, position },
        select: ticketSelect,
      });
    } catch {
      const { priority: _p, ...fallbackData } = data;
      const created = await prisma.ticket.create({
        data: { ...fallbackData, position },
        select: fallbackTicketSelect,
      });
      return { ...created, priority: data.priority ?? "MEDIUM" };
    }
  },

  async findById(id: number) {
    try {
      return await prisma.ticket.findUnique({
        where: { id },
        select: ticketSelect,
      });
    } catch {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        select: fallbackTicketSelect,
      });
      return ticket ? { ...ticket, priority: "MEDIUM" } : null;
    }
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

    try {
      const [tickets, total] = await Promise.all([
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
    } catch (err: any) {
      console.warn("Primary findByProject failed, attempting auto-repair/fallback:", err?.message);
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'MEDIUM';`
        );
        await prisma.$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "tickets_priority_idx" ON "tickets"("priority");`
        );
        const [tickets, total] = await Promise.all([
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
      } catch {
        const fallbackWhere = { ...where };
        delete fallbackWhere.priority;
        const [tickets, total] = await Promise.all([
          prisma.ticket.findMany({
            where: fallbackWhere,
            select: fallbackTicketSelect,
            orderBy: [{ status: "asc" }, { position: "asc" }],
            skip,
            take: limit,
          }),
          prisma.ticket.count({ where: fallbackWhere }),
        ]);
        const mappedTickets = tickets.map((t: any) => ({
          ...t,
          priority: "MEDIUM",
        }));
        return { tickets: mappedTickets, total, page, limit };
      }
    }
  },

  async update(id: number, data: UpdateTicketData) {
    try {
      return await prisma.ticket.update({
        where: { id },
        data,
        select: ticketSelect,
      });
    } catch (err: any) {
      console.warn("Primary ticket update failed, falling back:", err?.message);
      const { priority: _p, ...fallbackData } = data;
      const updated = await prisma.ticket.update({
        where: { id },
        data: fallbackData,
        select: fallbackTicketSelect,
      });
      if (data.priority !== undefined) {
        try {
          await prisma.$executeRawUnsafe(
            `UPDATE "tickets" SET "priority" = $1 WHERE "id" = $2`,
            data.priority,
            id
          );
        } catch {
          // ignore if column doesn't exist
        }
      }
      return { ...updated, priority: data.priority ?? (updated as any).priority ?? "MEDIUM" };
    }
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

      try {
        return await tx.ticket.update({
          where: { id: ticketId },
          data: {
            status: newStatus,
            sprint_id: newSprintId,
            position: newPosition,
          },
          select: ticketSelect,
        });
      } catch (err: any) {
        console.warn("Primary moveTicket update failed, falling back:", err?.message);
        const fallbackUpdated = await tx.ticket.update({
          where: { id: ticketId },
          data: {
            status: newStatus,
            sprint_id: newSprintId,
            position: newPosition,
          },
          select: fallbackTicketSelect,
        });
        return { ...fallbackUpdated, priority: (ticket as any).priority ?? "MEDIUM" };
      }
    });
  },

  async getRecentlyUpdated(userId: number, limit: number = 10) {
    const where = {
      project: {
        OR: [
          { created_by: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
    };
    try {
      return await prisma.ticket.findMany({
        where,
        select: ticketSelect,
        orderBy: { updated_at: "desc" },
        take: limit,
      });
    } catch {
      const tickets = await prisma.ticket.findMany({
        where,
        select: fallbackTicketSelect,
        orderBy: { updated_at: "desc" },
        take: limit,
      });
      return tickets.map((t: any) => ({ ...t, priority: "MEDIUM" }));
    }
  },

  async getAssignedToUser(userId: number, limit: number = 20) {
    const where = {
      assignee_id: userId,
      status: { not: "DONE" },
    };
    try {
      return await prisma.ticket.findMany({
        where,
        select: ticketSelect,
        orderBy: { updated_at: "desc" },
        take: limit,
      });
    } catch {
      const tickets = await prisma.ticket.findMany({
        where,
        select: fallbackTicketSelect,
        orderBy: { updated_at: "desc" },
        take: limit,
      });
      return tickets.map((t: any) => ({ ...t, priority: "MEDIUM" }));
    }
  },
};
