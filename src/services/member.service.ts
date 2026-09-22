import { memberRepository } from "../repositories/member.repository";
import { projectRepository } from "../repositories/project.repository";
import { userRepository } from "../repositories/user.repository";
import { createError } from "../middleware/error.middleware";

export const memberService = {
  async getMembers(projectId: number, userId: number) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw createError("Project not found.", 404);

    const membership = await memberRepository.findMembership(userId, projectId);
    const isOwner = project.created_by === userId;
    if (!membership && !isOwner) {
      throw createError("You do not have access to this project.", 403);
    }

    const members = await memberRepository.getProjectMembers(projectId);
    return members.map((m) => ({
      ...m.user,
      joined_at: m.created_at,
      is_owner: m.user.id === project.created_by,
    }));
  },

  async addMember(projectId: number, requestingUserId: number, targetEmail: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw createError("Project not found.", 404);
    if (project.created_by !== requestingUserId) {
      throw createError("Only the project owner can add members.", 403);
    }

    const targetUser = await userRepository.findByEmail(targetEmail);
    if (!targetUser) throw createError("No user found with that email address.", 404);
    if (!targetUser.is_active) throw createError("This user account is inactive.", 400);
    if (targetUser.role === "ADMIN") {
      throw createError("Administrators cannot be added as project members. The admin role is dedicated to user management.", 400);
    }

    const existing = await memberRepository.findMembership(targetUser.id, projectId);
    if (existing) throw createError("This user is already a member of the project.", 409);

    const membership = await memberRepository.addMember(targetUser.id, projectId);
    return {
      ...membership.user,
      joined_at: membership.created_at,
      is_owner: membership.user.id === project.created_by,
    };
  },

  async removeMember(projectId: number, requestingUserId: number, targetUserId: number) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw createError("Project not found.", 404);
    if (project.created_by !== requestingUserId) {
      throw createError("Only the project owner can remove members.", 403);
    }
    if (project.created_by === targetUserId) {
      throw createError("Cannot remove the project owner from the project.", 400);
    }

    const membership = await memberRepository.findMembership(targetUserId, projectId);
    if (!membership) throw createError("This user is not a member of the project.", 404);

    await memberRepository.removeMember(targetUserId, projectId);
  },
};
