"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_LIMIT = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = exports.JWT_COOKIE_NAME = exports.TICKET_PRIORITIES = exports.TICKET_STATUS = exports.SPRINT_STATUS = exports.PROJECT_STATUS = exports.APP_VERSION = exports.APP_NAME = void 0;
exports.APP_NAME = "ProjectFlow";
exports.APP_VERSION = "v1.0.2";
exports.PROJECT_STATUS = ["ACTIVE", "COMPLETED", "ARCHIVED"];
exports.SPRINT_STATUS = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];
exports.TICKET_STATUS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
exports.TICKET_PRIORITIES = ["HIGHEST", "HIGH", "MEDIUM", "LOW", "LOWEST"];
exports.JWT_COOKIE_NAME = "projectflow_token";
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 20;
exports.MAX_LIMIT = 500;
//# sourceMappingURL=app.constants.js.map