"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberService = void 0;
const member_repository_1 = require("../repositories/member.repository");
const project_repository_1 = require("../repositories/project.repository");
const user_repository_1 = require("../repositories/user.repository");
const error_middleware_1 = require("../middleware/error.middleware");
exports.memberService = {
    async getMembers(projectId, userId) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        const membership = await member_repository_1.memberRepository.findMembership(userId, projectId);
        const isOwner = project.created_by === userId;
        if (!membership && !isOwner) {
            throw (0, error_middleware_1.createError)("You do not have access to this project.", 403);
        }
        const members = await member_repository_1.memberRepository.getProjectMembers(projectId);
        return members.map((m) => ({
            ...m.user,
            joined_at: m.created_at,
            is_owner: m.user.id === project.created_by,
        }));
    },
    async addMember(projectId, requestingUserId, targetEmail) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        if (project.created_by !== requestingUserId) {
            throw (0, error_middleware_1.createError)("Only the project owner can add members.", 403);
        }
        const targetUser = await user_repository_1.userRepository.findByEmail(targetEmail);
        if (!targetUser)
            throw (0, error_middleware_1.createError)("No user found with that email address.", 404);
        if (!targetUser.is_active)
            throw (0, error_middleware_1.createError)("This user account is inactive.", 400);
        if (targetUser.role === "ADMIN") {
            throw (0, error_middleware_1.createError)("Administrators cannot be added as project members. The admin role is dedicated to user management.", 400);
        }
        const existing = await member_repository_1.memberRepository.findMembership(targetUser.id, projectId);
        if (existing)
            throw (0, error_middleware_1.createError)("This user is already a member of the project.", 409);
        const membership = await member_repository_1.memberRepository.addMember(targetUser.id, projectId);
        return {
            ...membership.user,
            joined_at: membership.created_at,
            is_owner: membership.user.id === project.created_by,
        };
    },
    async addMembers(projectId, requestingUserId, targetEmails) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        if (project.created_by !== requestingUserId) {
            throw (0, error_middleware_1.createError)("Only the project owner can add members.", 403);
        }
        const added = [];
        const errors = [];
        // Filter unique emails
        const uniqueEmails = Array.from(new Set(targetEmails.map((e) => e.trim().toLowerCase()))).filter(Boolean);
        for (const email of uniqueEmails) {
            const targetUser = await user_repository_1.userRepository.findByEmail(email);
            if (!targetUser) {
                errors.push({ email, error: "No user found with that email address." });
                continue;
            }
            if (!targetUser.is_active) {
                errors.push({ email, error: "This user account is inactive." });
                continue;
            }
            if (targetUser.role === "ADMIN") {
                errors.push({ email, error: "Administrators cannot be added as project members." });
                continue;
            }
            const existing = await member_repository_1.memberRepository.findMembership(targetUser.id, projectId);
            if (existing) {
                errors.push({ email, error: "User is already a member." });
                continue;
            }
            const membership = await member_repository_1.memberRepository.addMember(targetUser.id, projectId);
            added.push({
                ...membership.user,
                joined_at: membership.created_at,
                is_owner: membership.user.id === project.created_by,
            });
        }
        if (added.length === 0 && errors.length > 0) {
            throw (0, error_middleware_1.createError)(errors.map((e) => `${e.email}: ${e.error}`).join("; "), 400);
        }
        return { added, errors };
    },
    async removeMember(projectId, requestingUserId, targetUserId) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        if (project.created_by !== requestingUserId) {
            throw (0, error_middleware_1.createError)("Only the project owner can remove members.", 403);
        }
        if (project.created_by === targetUserId) {
            throw (0, error_middleware_1.createError)("Cannot remove the project owner from the project.", 400);
        }
        const membership = await member_repository_1.memberRepository.findMembership(targetUserId, projectId);
        if (!membership)
            throw (0, error_middleware_1.createError)("This user is not a member of the project.", 404);
        await member_repository_1.memberRepository.removeMember(targetUserId, projectId);
    },
};
//# sourceMappingURL=member.service.js.map