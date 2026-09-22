"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const project_repository_1 = require("../repositories/project.repository");
const member_repository_1 = require("../repositories/member.repository");
const user_repository_1 = require("../repositories/user.repository");
const error_middleware_1 = require("../middleware/error.middleware");
exports.projectService = {
    async createProject(userId, name, description) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (user?.role === "ADMIN") {
            throw (0, error_middleware_1.createError)("Administrators cannot create projects. The admin role is dedicated to user management and approvals.", 403);
        }
        const trimmedName = name.trim();
        const existing = await project_repository_1.projectRepository.findByName(trimmedName);
        if (existing) {
            throw (0, error_middleware_1.createError)(`A project named "${trimmedName}" already exists. Please choose a unique name.`, 409);
        }
        return project_repository_1.projectRepository.createWithOwnerMembership({
            name: trimmedName,
            description,
            created_by: userId,
        });
    },
    async getProjects(userId, page, limit) {
        return project_repository_1.projectRepository.findByMemberUserId(userId, page, limit);
    },
    async getProjectById(projectId, userId) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        const isOwner = project.created_by === userId;
        const membership = isOwner ? null : await member_repository_1.memberRepository.findMembership(userId, projectId);
        if (!isOwner && !membership) {
            throw (0, error_middleware_1.createError)("You do not have access to this project.", 403);
        }
        return project;
    },
    async updateProject(projectId, userId, data) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        if (project.created_by !== userId) {
            throw (0, error_middleware_1.createError)("Only the project owner can update this project.", 403);
        }
        if (data.name && data.name.trim() !== project.name) {
            const trimmedName = data.name.trim();
            const existing = await project_repository_1.projectRepository.findByName(trimmedName);
            if (existing && existing.id !== projectId) {
                throw (0, error_middleware_1.createError)(`A project named "${trimmedName}" already exists. Please choose a unique name.`, 409);
            }
        }
        return project_repository_1.projectRepository.update(projectId, data);
    },
    async deleteProject(projectId, userId) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        if (project.created_by !== userId) {
            throw (0, error_middleware_1.createError)("Only the project owner can delete this project.", 403);
        }
        return project_repository_1.projectRepository.delete(projectId);
    },
    async getProjectSummary(projectId, userId) {
        const project = await project_repository_1.projectRepository.findById(projectId);
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        const isOwner = project.created_by === userId;
        const membership = isOwner ? null : await member_repository_1.memberRepository.findMembership(userId, projectId);
        if (!isOwner && !membership) {
            throw (0, error_middleware_1.createError)("You do not have access to this project.", 403);
        }
        const summary = await project_repository_1.projectRepository.getTicketSummary(projectId);
        return { project, summary };
    },
    isOwner(project, userId) {
        return project.created_by === userId;
    },
};
//# sourceMappingURL=project.service.js.map