"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const project_service_1 = require("../services/project.service");
const project_excel_service_1 = require("../services/project-excel.service");
const app_constants_1 = require("../constants/app.constants");
const error_middleware_1 = require("../middleware/error.middleware");
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
    async downloadSampleTemplate(req, res, next) {
        try {
            await project_excel_service_1.projectExcelService.generateSampleTemplate(res);
        }
        catch (error) {
            next(error);
        }
    },
    async exportXlsx(req, res, next) {
        try {
            await project_excel_service_1.projectExcelService.exportProject(parseInt(req.params.projectId), req.user.userId, res);
        }
        catch (error) {
            next(error);
        }
    },
    async importXlsx(req, res, next) {
        try {
            if (!req.file) {
                throw (0, error_middleware_1.createError)("Please upload an Excel (.xlsx) file.", 400);
            }
            const result = await project_excel_service_1.projectExcelService.importProjectFromXlsx(req.user.userId, req.file.path);
            res.status(201).json({
                success: true,
                message: "Project imported successfully.",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async importIntoProject(req, res, next) {
        try {
            if (!req.file) {
                throw (0, error_middleware_1.createError)("Please upload an Excel (.xlsx) file.", 400);
            }
            const result = await project_excel_service_1.projectExcelService.importProjectFromXlsx(req.user.userId, req.file.path, parseInt(req.params.projectId));
            res.json({
                success: true,
                message: "Data imported into project successfully.",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=project.controller.js.map