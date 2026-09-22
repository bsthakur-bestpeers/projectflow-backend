import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/project.service";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../constants/app.constants";

export const projectController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const project = await projectService.createProject(req.user!.userId, name, description);
      res.status(201).json({ success: true, data: project });
    } catch (error) { next(error); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
      const result = await projectService.getProjects(req.user!.userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProjectById(
        parseInt(req.params.projectId), req.user!.userId
      );
      res.json({ success: true, data: project });
    } catch (error) { next(error); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(
        parseInt(req.params.projectId), req.user!.userId, req.body
      );
      res.json({ success: true, data: project });
    } catch (error) { next(error); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.deleteProject(parseInt(req.params.projectId), req.user!.userId);
      res.json({ success: true, message: "Project deleted successfully." });
    } catch (error) { next(error); }
  },

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.getProjectSummary(
        parseInt(req.params.projectId), req.user!.userId
      );
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },
};
