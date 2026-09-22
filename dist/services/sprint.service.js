"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintService = void 0;
const sprint_repository_1 = require("../repositories/sprint.repository");
const project_repository_1 = require("../repositories/project.repository");
const member_repository_1 = require("../repositories/member.repository");
const error_middleware_1 = require("../middleware/error.middleware");
async function assertProjectOwner(projectId, userId) {
    const project = await project_repository_1.projectRepository.findById(projectId);
    if (!project)
        throw (0, error_middleware_1.createError)("Project not found.", 404);
    if (project.created_by !== userId) {
        throw (0, error_middleware_1.createError)("Only the project owner can manage sprints.", 403);
    }
    return project;
}
async function assertProjectMember(projectId, userId) {
    const project = await project_repository_1.projectRepository.findById(projectId);
    if (!project)
        throw (0, error_middleware_1.createError)("Project not found.", 404);
    const membership = await member_repository_1.memberRepository.findMembership(userId, projectId);
    const isOwner = project.created_by === userId;
    if (!membership && !isOwner) {
        throw (0, error_middleware_1.createError)("You do not have access to this project.", 403);
    }
    return project;
}
exports.sprintService = {
    async createSprint(projectId, userId, data) {
        await assertProjectMember(projectId, userId);
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        if (startDate >= endDate) {
            throw (0, error_middleware_1.createError)("Start date must be before end date.", 400);
        }
        const overlap = await sprint_repository_1.sprintRepository.findOverlapping(projectId, startDate, endDate);
        if (overlap) {
            throw (0, error_middleware_1.createError)(`Sprint dates overlap with existing sprint: "${overlap.name ?? `Sprint #${overlap.id}`}".`, 409);
        }
        // Ensure new sprint starts after the latest sprint's end date (next day, not same day)
        const latestSprint = await sprint_repository_1.sprintRepository.findLatestByEndDate(projectId);
        if (latestSprint) {
            const lastEndStr = new Date(latestSprint.end_date).toISOString().slice(0, 10);
            const newStartStr = startDate.toISOString().slice(0, 10);
            if (newStartStr <= lastEndStr) {
                // Calculate the next day after the latest end date
                const nextDay = new Date(latestSprint.end_date);
                nextDay.setUTCDate(nextDay.getUTCDate() + 1);
                const nextDayStr = nextDay.toISOString().slice(0, 10);
                throw (0, error_middleware_1.createError)(`New sprint cannot start on or before the previous sprint's end date (${lastEndStr}). It must start on or after ${nextDayStr}.`, 400);
            }
        }
        // Auto-generate sprint name if not provided
        let sprintName = data.name;
        if (!sprintName) {
            const count = await sprint_repository_1.sprintRepository.countByProject(projectId);
            sprintName = `Sprint ${count + 1}`;
        }
        return sprint_repository_1.sprintRepository.create({ ...data, project_id: projectId, name: sprintName, start_date: startDate, end_date: endDate });
    },
    async getSprints(projectId, userId) {
        await assertProjectMember(projectId, userId);
        return sprint_repository_1.sprintRepository.findByProject(projectId);
    },
    async getSprintById(sprintId, userId) {
        const sprint = await sprint_repository_1.sprintRepository.findById(sprintId);
        if (!sprint)
            throw (0, error_middleware_1.createError)("Sprint not found.", 404);
        await assertProjectMember(sprint.project_id, userId);
        return sprint;
    },
    async updateSprint(sprintId, userId, data) {
        const sprint = await sprint_repository_1.sprintRepository.findById(sprintId);
        if (!sprint)
            throw (0, error_middleware_1.createError)("Sprint not found.", 404);
        await assertProjectMember(sprint.project_id, userId);
        // If status transition is requested
        if (data.status && data.status !== sprint.status) {
            if (data.status === "ACTIVE") {
                const activeSprint = await sprint_repository_1.sprintRepository.findActiveByProject(sprint.project_id);
                if (activeSprint && activeSprint.id !== sprintId) {
                    throw (0, error_middleware_1.createError)(`Another sprint is already active: "${activeSprint.name ?? `Sprint #${activeSprint.id}`}". Complete or cancel it before activating this one.`, 409);
                }
                const now = new Date();
                const oldStart = new Date(sprint.start_date).getTime();
                const oldEnd = new Date(sprint.end_date).getTime();
                const duration = oldEnd - oldStart;
                const newEndDate = duration > 0 ? new Date(now.getTime() + duration) : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
                return sprint_repository_1.sprintRepository.startSprint(sprintId, now, newEndDate);
            }
            else if (data.status === "COMPLETED") {
                const now = new Date();
                return sprint_repository_1.sprintRepository.completeSprint(sprintId, now);
            }
            else if (data.status === "CANCELLED") {
                return sprint_repository_1.sprintRepository.cancelSprint(sprintId);
            }
        }
        const startDate = data.start_date ? new Date(data.start_date) : sprint.start_date;
        const endDate = data.end_date ? new Date(data.end_date) : sprint.end_date;
        if (startDate >= endDate) {
            throw (0, error_middleware_1.createError)("Start date must be before end date.", 400);
        }
        if (data.start_date || data.end_date) {
            const overlap = await sprint_repository_1.sprintRepository.findOverlapping(sprint.project_id, startDate, endDate, sprintId);
            if (overlap) {
                throw (0, error_middleware_1.createError)(`Sprint dates overlap with existing sprint: "${overlap.name ?? `Sprint #${overlap.id}`}".`, 409);
            }
        }
        return sprint_repository_1.sprintRepository.update(sprintId, { ...data, start_date: startDate, end_date: endDate });
    },
    async deleteSprint(sprintId, userId) {
        const sprint = await sprint_repository_1.sprintRepository.findById(sprintId);
        if (!sprint)
            throw (0, error_middleware_1.createError)("Sprint not found.", 404);
        await assertProjectMember(sprint.project_id, userId);
        return sprint_repository_1.sprintRepository.delete(sprintId);
    },
    async startSprint(sprintId, userId) {
        const sprint = await sprint_repository_1.sprintRepository.findById(sprintId);
        if (!sprint)
            throw (0, error_middleware_1.createError)("Sprint not found.", 404);
        await assertProjectMember(sprint.project_id, userId);
        if (sprint.status !== "PLANNED") {
            throw (0, error_middleware_1.createError)("Only PLANNED sprints can be started.", 400);
        }
        const activeSprint = await sprint_repository_1.sprintRepository.findActiveByProject(sprint.project_id);
        if (activeSprint) {
            throw (0, error_middleware_1.createError)(`Another sprint is already active: "${activeSprint.name ?? `Sprint #${activeSprint.id}`}". Complete it before starting a new one.`, 409);
        }
        const now = new Date();
        const oldStart = new Date(sprint.start_date).getTime();
        const oldEnd = new Date(sprint.end_date).getTime();
        const duration = oldEnd - oldStart;
        let newEndDate;
        if (duration > 0) {
            newEndDate = new Date(now.getTime() + duration);
        }
        else {
            newEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        }
        return sprint_repository_1.sprintRepository.startSprint(sprintId, now, newEndDate);
    },
    async completeSprint(sprintId, userId) {
        const sprint = await sprint_repository_1.sprintRepository.findById(sprintId);
        if (!sprint)
            throw (0, error_middleware_1.createError)("Sprint not found.", 404);
        await assertProjectMember(sprint.project_id, userId);
        if (sprint.status !== "ACTIVE") {
            throw (0, error_middleware_1.createError)("Only ACTIVE sprints can be completed.", 400);
        }
        const now = new Date();
        return sprint_repository_1.sprintRepository.completeSprint(sprintId, now);
    },
};
//# sourceMappingURL=sprint.service.js.map