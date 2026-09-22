"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const project_service_1 = require("../services/project.service");
const app_constants_1 = require("../constants/app.constants");
exports.projectController = {
    async create(req, res, next) {
        try {
            const { name, description } = req.body;
            const project = await project_service_1.projectService.createProject(req.user.userId, name, description);
            res.status(201).json({ success: true, data: project });
        }
        catch (error) {
            next(error);
        }
    },
    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || app_constants_1.DEFAULT_PAGE;
            const limit = parseInt(req.query.limit) || app_constants_1.DEFAULT_LIMIT;
            const result = await project_service_1.projectService.getProjects(req.user.userId, page, limit);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const project = await project_service_1.projectService.getProjectById(parseInt(req.params.projectId), req.user.userId);
            res.json({ success: true, data: project });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const project = await project_service_1.projectService.updateProject(parseInt(req.params.projectId), req.user.userId, req.body);
            res.json({ success: true, data: project });
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await project_service_1.projectService.deleteProject(parseInt(req.params.projectId), req.user.userId);
            res.json({ success: true, message: "Project deleted successfully." });
        }
        catch (error) {
            next(error);
        }
    },
    async getSummary(req, res, next) {
        try {
            const result = await project_service_1.projectService.getProjectSummary(parseInt(req.params.projectId), req.user.userId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=project.controller.js.map