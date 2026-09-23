import prisma from "../db/prisma";

export interface CreateProjectData {
  name: string;
  description?: string;
  created_by: number;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
}

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

export const projectRepository = {
  async createWithOwnerMembership(data: CreateProjectData) {
    return prisma.$transaction(async (tx) => {
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

  async findById(id: number) {
    return prisma.project.findUnique({
      where: { id },
      select: projectSelect,
    });
  },

  async findByName(name: string) {
    return prisma.project.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
      select: projectSelect,
    });
  },

  async findByMemberUserId(
    userId: number,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where: { members: { some: { user_id: userId } } },
        select: projectSelect,
        orderBy: { updated_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({
        where: { members: { some: { user_id: userId } } },
      }),
    ]);
    return { projects, total, page, limit };
  },

  async update(id: number, data: UpdateProjectData) {
    return prisma.project.update({
      where: { id },
      data,
      select: projectSelect,
    });
  },

  async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      await tx.ticket.deleteMany({ where: { project_id: id } });
      await tx.sprint.deleteMany({ where: { project_id: id } });
      await tx.userProject.deleteMany({ where: { project_id: id } });
      return tx.project.delete({ where: { id } });
    });
  },

  async getTicketSummary(projectId: number) {
    const [total, todo, inProgress, inReview, done] = await prisma.$transaction([
      prisma.ticket.count({ where: { project_id: projectId, sprint_id: { not: null } } }),
      prisma.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "TODO" } }),
      prisma.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "IN_REVIEW" } }),
      prisma.ticket.count({ where: { project_id: projectId, sprint_id: { not: null }, status: "DONE" } }),
    ]);
    return { total, TODO: todo, IN_PROGRESS: inProgress, IN_REVIEW: inReview, DONE: done };
  },
};
