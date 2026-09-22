"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintController = void 0;
const sprint_service_1 = require("../services/sprint.service");
exports.sprintController = {
    async create(req, res, next) {
        try {
            const sprint = await sprint_service_1.sprintService.createSprint(parseInt(req.params.projectId), req.user.userId, req.body);
            res.status(201).json({ success: true, data: sprint });
        }
        catch (error) {
            next(error);
        }
    },
    async listByProject(req, res, next) {
        try {
            const sprints = await sprint_service_1.sprintService.getSprints(parseInt(req.params.projectId), req.user.userId);
            res.json({ success: true, data: sprints });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const sprint = await sprint_service_1.sprintService.getSprintById(parseInt(req.params.sprintId), req.user.userId);
            res.json({ success: true, data: sprint });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const sprint = await sprint_service_1.sprintService.updateSprint(parseInt(req.params.sprintId), req.user.userId, req.body);
            res.json({ success: true, data: sprint });
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await sprint_service_1.sprintService.deleteSprint(parseInt(req.params.sprintId), req.user.userId);
            res.json({ success: true, message: "Sprint deleted successfully." });
        }
        catch (error) {
            next(error);
        }
    },
    async start(req, res, next) {
        try {
            const sprint = await sprint_service_1.sprintService.startSprint(parseInt(req.params.sprintId), req.user.userId);
            res.json({ success: true, data: sprint, message: "Sprint started successfully." });
        }
        catch (error) {
            next(error);
        }
    },
    async complete(req, res, next) {
        try {
            const sprint = await sprint_service_1.sprintService.completeSprint(parseInt(req.params.sprintId), req.user.userId);
            res.json({ success: true, data: sprint, message: "Sprint completed successfully." });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=sprint.controller.js.map