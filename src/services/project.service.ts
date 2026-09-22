import { projectRepository, CreateProjectData, UpdateProjectData } from "../repositories/project.repository";
import { memberRepository } from "../repositories/member.repository";
import { userRepository } from "../repositories/user.repository";
import { createError } from "../middleware/error.middleware";

export const projectService = {
  async createProject(userId: number, name: string, description?: string) {
    const user = await userRepository.findById(userId);
    if (user?.role === "ADMIN") {
      throw createError("Administrators cannot create projects. The admin role is dedicated to user management and approvals.", 403);
    }

    const trimmedName = name.trim();
    const existing = await projectRepository.findByName(trimmedName);
    if (existing) {
      throw createError(`A project named "${trimmedName}" already exists. Please choose a unique name.`, 409);
    }
    return projectRepository.createWithOwnerMembership({
      name: trimmedName,
      description,
      created_by: userId,
    });
  },

  async getProjects(userId: number, page: number, limit: number) {
    return projectRepository.findByMemberUserId(userId, page, limit);
  },

  async getProjectById(projectId: number, userId: number) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw createError("Project not found.", 404);

    const isOwner = project.created_by === userId;
    const membership = isOwner ? null : await memberRepository.findMembership(userId, projectId);
    if (!isOwner && !membership) {
      throw createError("You do not have access to this project.", 403);
    }
    return project;
  },

  async updateProject(projectId: number, userId: number, data: UpdateProjectData) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw createError("Project not found.", 404);
    if (project.created_by !== userId) {
      throw createError("Only the project owner can update this project.", 403);
    }
    if (data.name && data.name.trim() !== project.name) {
      const trimmedName = data.name.trim();
      const existing = await projectRepository.findByName(trimmedName);
      if (existing && existing.id !== projectId) {
        throw createError(`A project named "${trimmedName}" already exists. Please choose a unique name.`, 409);
      }
    }
    return projectRepository.update(projectId, data);
  },

  async deleteProject(projectId: number, userId: number) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw createError("Project not found.", 404);
    if (project.created_by !== userId) {
      throw createError("Only the project owner can delete this project.", 403);
    }
    return projectRepository.delete(projectId);
  },

  async getProjectSummary(projectId: number, userId: number) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw createError("Project not found.", 404);

    const isOwner = project.created_by === userId;
    const membership = isOwner ? null : await memberRepository.findMembership(userId, projectId);
    if (!isOwner && !membership) {
      throw createError("You do not have access to this project.", 403);
    }

    const summary = await projectRepository.getTicketSummary(projectId);
    return { project, summary };
  },

  isOwner(project: { created_by: number }, userId: number): boolean {
    return project.created_by === userId;
  },
};
