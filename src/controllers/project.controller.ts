import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/project.service";
import { projectExcelService } from "../services/project-excel.service";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../constants/app.constants";
import { createError } from "../middleware/error.middleware";

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

  async downloadSampleTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      await projectExcelService.generateSampleTemplate(res);
    } catch (error) { next(error); }
  },

  async exportMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectIds } = req.query;
      let ids: number[] = [];
      if (typeof projectIds === "string" && projectIds.trim().length > 0) {
        ids = projectIds
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((n) => !isNaN(n) && n > 0);
      }
      if (ids.length === 0) {
        const result = await projectService.getProjects(req.user!.userId, 1, 1000);
        ids = result.projects.map((p: any) => p.id);
      }
      if (ids.length === 0) {
        throw createError("No projects available to export.", 400);
      }
      await projectExcelService.exportProjects(ids, req.user!.userId, res);
    } catch (error) { next(error); }
  },

  async exportXlsx(req: Request, res: Response, next: NextFunction) {
    try {
      await projectExcelService.exportProject(
        parseInt(req.params.projectId),
        req.user!.userId,
        res
      );
    } catch (error) { next(error); }
  },

  async importXlsx(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw createError("Please upload an Excel (.xlsx) file.", 400);
      }
      const result = await projectExcelService.importProjectFromXlsx(
        req.user!.userId,
        req.file.path
      );
      res.status(201).json({
        success: true,
        message: "Project imported successfully.",
        data: result,
      });
    } catch (error) { next(error); }
  },

  async importIntoProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw createError("Please upload an Excel (.xlsx) file.", 400);
      }
      const result = await projectExcelService.importProjectFromXlsx(
        req.user!.userId,
        req.file.path,
        parseInt(req.params.projectId)
      );
      res.json({
        success: true,
        message: "Data imported into project successfully.",
        data: result,
      });
    } catch (error) { next(error); }
  },
};
