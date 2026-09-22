import prisma from "../db/prisma";

export interface CreateSprintData {
  project_id: number;
  name?: string | null;
  start_date: Date;
  end_date: Date;
}

export interface UpdateSprintData {
  name?: string | null;
  start_date?: Date;
  end_date?: Date;
  status?: string;
}

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

export const sprintRepository = {
  async create(data: CreateSprintData) {
    return prisma.sprint.create({
      data: {
        project_id: data.project_id,
        name: data.name ?? null,
        start_date: data.start_date,
        end_date: data.end_date,
      },
      select: sprintSelect,
    });
  },

  async findById(id: number) {
    return prisma.sprint.findUnique({
      where: { id },
      select: sprintSelect,
    });
  },

  async findByProject(projectId: number) {
    return prisma.sprint.findMany({
      where: { project_id: projectId },
      select: sprintSelect,
      orderBy: [{ id: "desc" }],
    });
  },

  async findActiveByProject(projectId: number) {
    return prisma.sprint.findFirst({
      where: { project_id: projectId, status: "ACTIVE" },
      select: sprintSelect,
    });
  },

  async findOverlapping(
    projectId: number,
    startDate: Date,
    endDate: Date,
    excludeSprintId?: number
  ) {
    return prisma.sprint.findFirst({
      where: {
        project_id: projectId,
        id: excludeSprintId ? { not: excludeSprintId } : undefined,
        status: { not: "COMPLETED" },
        start_date: { lte: endDate },
        end_date: { gte: startDate },
      },
    });
  },

  async countByProject(projectId: number) {
    return prisma.sprint.count({ where: { project_id: projectId } });
  },

  async findLatestByEndDate(projectId: number) {
    return prisma.sprint.findFirst({
      where: { project_id: projectId },
      orderBy: { end_date: "desc" },
      select: sprintSelect,
    });
  },

  async update(id: number, data: UpdateSprintData) {
    return prisma.sprint.update({
      where: { id },
      data,
      select: sprintSelect,
    });
  },

  async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { sprint_id: id },
        data: { sprint_id: null },
      });
      return tx.sprint.delete({ where: { id } });
    });
  },

  async startSprint(sprintId: number, startDate?: Date, endDate?: Date) {
    const data: { status: string; start_date?: Date; end_date?: Date } = {
      status: "ACTIVE",
    };
    if (startDate) data.start_date = startDate;
    if (endDate) data.end_date = endDate;
    return prisma.sprint.update({
      where: { id: sprintId },
      data,
      select: sprintSelect,
    });
  },

  async completeSprint(sprintId: number, endDate?: Date) {
    const data: { status: string; end_date?: Date } = {
      status: "COMPLETED",
    };
    if (endDate) data.end_date = endDate;
    return prisma.sprint.update({
      where: { id: sprintId },
      data,
      select: sprintSelect,
    });
  },

  async cancelSprint(sprintId: number) {
    return prisma.$transaction(async (tx) => {
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
