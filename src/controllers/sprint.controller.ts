import { Request, Response, NextFunction } from "express";
import { sprintService } from "../services/sprint.service";

export const sprintController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.createSprint(
        parseInt(req.params.projectId), req.user!.userId, req.body
      );
      res.status(201).json({ success: true, data: sprint });
    } catch (error) { next(error); }
  },

  async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const sprints = await sprintService.getSprints(
        parseInt(req.params.projectId), req.user!.userId
      );
      res.json({ success: true, data: sprints });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.getSprintById(
        parseInt(req.params.sprintId), req.user!.userId
      );
      res.json({ success: true, data: sprint });
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.updateSprint(
        parseInt(req.params.sprintId), req.user!.userId, req.body
      );
      res.json({ success: true, data: sprint });
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await sprintService.deleteSprint(parseInt(req.params.sprintId), req.user!.userId);
      res.json({ success: true, message: "Sprint deleted successfully." });
    } catch (error) { next(error); }
  },

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.startSprint(
        parseInt(req.params.sprintId), req.user!.userId
      );
      res.json({ success: true, data: sprint, message: "Sprint started successfully." });
    } catch (error) { next(error); }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.completeSprint(
        parseInt(req.params.sprintId), req.user!.userId
      );
      res.json({ success: true, data: sprint, message: "Sprint completed successfully." });
    } catch (error) { next(error); }
  },
};
