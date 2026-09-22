import { sprintRepository, CreateSprintData, UpdateSprintData } from "../repositories/sprint.repository";
import { projectRepository } from "../repositories/project.repository";
import { memberRepository } from "../repositories/member.repository";
import { createError } from "../middleware/error.middleware";

async function assertProjectOwner(projectId: number, userId: number) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw createError("Project not found.", 404);
  if (project.created_by !== userId) {
    throw createError("Only the project owner can manage sprints.", 403);
  }
  return project;
}

async function assertProjectMember(projectId: number, userId: number) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw createError("Project not found.", 404);
  const membership = await memberRepository.findMembership(userId, projectId);
  const isOwner = project.created_by === userId;
  if (!membership && !isOwner) {
    throw createError("You do not have access to this project.", 403);
  }
  return project;
}

export const sprintService = {
  async createSprint(projectId: number, userId: number, data: Omit<CreateSprintData, "project_id">) {
    await assertProjectMember(projectId, userId);

    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (startDate >= endDate) {
      throw createError("Start date must be before end date.", 400);
    }

    const overlap = await sprintRepository.findOverlapping(projectId, startDate, endDate);
    if (overlap) {
      throw createError(
        `Sprint dates overlap with existing sprint: "${overlap.name ?? `Sprint #${overlap.id}`}".`,
        409
      );
    }

    // Ensure new sprint starts after the latest sprint's end date (next day, not same day)
    const latestSprint = await sprintRepository.findLatestByEndDate(projectId);
    if (latestSprint) {
      const lastEndStr = new Date(latestSprint.end_date).toISOString().slice(0, 10);
      const newStartStr = startDate.toISOString().slice(0, 10);
      if (newStartStr <= lastEndStr) {
        // Calculate the next day after the latest end date
        const nextDay = new Date(latestSprint.end_date);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const nextDayStr = nextDay.toISOString().slice(0, 10);
        throw createError(
          `New sprint cannot start on or before the previous sprint's end date (${lastEndStr}). It must start on or after ${nextDayStr}.`,
          400
        );
      }
    }

    // Auto-generate sprint name if not provided
    let sprintName = data.name;
    if (!sprintName) {
      const count = await sprintRepository.countByProject(projectId);
      sprintName = `Sprint ${count + 1}`;
    }

    return sprintRepository.create({ ...data, project_id: projectId, name: sprintName, start_date: startDate, end_date: endDate });
  },

  async getSprints(projectId: number, userId: number) {
    await assertProjectMember(projectId, userId);
    return sprintRepository.findByProject(projectId);
  },

  async getSprintById(sprintId: number, userId: number) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) throw createError("Sprint not found.", 404);
    await assertProjectMember(sprint.project_id, userId);
    return sprint;
  },

  async updateSprint(sprintId: number, userId: number, data: UpdateSprintData) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) throw createError("Sprint not found.", 404);
    await assertProjectMember(sprint.project_id, userId);

    // If status transition is requested
    if (data.status && data.status !== sprint.status) {
      if (data.status === "ACTIVE") {
        const activeSprint = await sprintRepository.findActiveByProject(sprint.project_id);
        if (activeSprint && activeSprint.id !== sprintId) {
          throw createError(
            `Another sprint is already active: "${activeSprint.name ?? `Sprint #${activeSprint.id}`}". Complete or cancel it before activating this one.`,
            409
          );
        }
        const now = new Date();
        const oldStart = new Date(sprint.start_date).getTime();
        const oldEnd = new Date(sprint.end_date).getTime();
        const duration = oldEnd - oldStart;
        const newEndDate = duration > 0 ? new Date(now.getTime() + duration) : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        return sprintRepository.startSprint(sprintId, now, newEndDate);
      } else if (data.status === "COMPLETED") {
        const now = new Date();
        return sprintRepository.completeSprint(sprintId, now);
      } else if (data.status === "CANCELLED") {
        return sprintRepository.cancelSprint(sprintId);
      }
    }

    const startDate = data.start_date ? new Date(data.start_date) : sprint.start_date;
    const endDate = data.end_date ? new Date(data.end_date) : sprint.end_date;

    if (startDate >= endDate) {
      throw createError("Start date must be before end date.", 400);
    }

    if (data.start_date || data.end_date) {
      const overlap = await sprintRepository.findOverlapping(
        sprint.project_id, startDate, endDate, sprintId
      );
      if (overlap) {
        throw createError(
          `Sprint dates overlap with existing sprint: "${overlap.name ?? `Sprint #${overlap.id}`}".`,
          409
        );
      }
    }

    return sprintRepository.update(sprintId, { ...data, start_date: startDate, end_date: endDate });
  },

  async deleteSprint(sprintId: number, userId: number) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) throw createError("Sprint not found.", 404);
    await assertProjectMember(sprint.project_id, userId);

    return sprintRepository.delete(sprintId);
  },

  async startSprint(sprintId: number, userId: number) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) throw createError("Sprint not found.", 404);
    await assertProjectMember(sprint.project_id, userId);

    if (sprint.status !== "PLANNED") {
      throw createError("Only PLANNED sprints can be started.", 400);
    }

    const activeSprint = await sprintRepository.findActiveByProject(sprint.project_id);
    if (activeSprint) {
      throw createError(
        `Another sprint is already active: "${activeSprint.name ?? `Sprint #${activeSprint.id}`}". Complete it before starting a new one.`,
        409
      );
    }

    const now = new Date();
    const oldStart = new Date(sprint.start_date).getTime();
    const oldEnd = new Date(sprint.end_date).getTime();
    const duration = oldEnd - oldStart;

    let newEndDate: Date;
    if (duration > 0) {
      newEndDate = new Date(now.getTime() + duration);
    } else {
      newEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    return sprintRepository.startSprint(sprintId, now, newEndDate);
  },

  async completeSprint(sprintId: number, userId: number) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) throw createError("Sprint not found.", 404);
    await assertProjectMember(sprint.project_id, userId);

    if (sprint.status !== "ACTIVE") {
      throw createError("Only ACTIVE sprints can be completed.", 400);
    }

    const now = new Date();
    return sprintRepository.completeSprint(sprintId, now);
  },
};
