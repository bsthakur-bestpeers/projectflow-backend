import prisma from "../db/prisma";

export const memberRepository = {
  async findMembership(userId: number, projectId: number) {
    return prisma.userProject.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } },
    });
  },

  async addMember(userId: number, projectId: number) {
    return prisma.userProject.create({
      data: { user_id: userId, project_id: projectId },
      include: {
        user: { select: { id: true, full_name: true, email: true } },
      },
    });
  },

  async removeMember(userId: number, projectId: number) {
    return prisma.userProject.delete({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } },
    });
  },

  async getProjectMembers(projectId: number) {
    return prisma.userProject.findMany({
      where: { project_id: projectId },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, is_active: true },
        },
      },
      orderBy: { created_at: "asc" },
    });
  },
};
