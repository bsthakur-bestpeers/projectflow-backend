export declare const APP_NAME = "ProjectFlow";
export declare const APP_VERSION = "v1.0.2";
export declare const PROJECT_STATUS: readonly ["ACTIVE", "COMPLETED", "ARCHIVED"];
export type ProjectStatus = (typeof PROJECT_STATUS)[number];
export declare const SPRINT_STATUS: readonly ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];
export type SprintStatus = (typeof SPRINT_STATUS)[number];
export declare const TICKET_STATUS: readonly ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
export type TicketStatus = (typeof TICKET_STATUS)[number];
export declare const TICKET_PRIORITIES: readonly ["HIGH", "MEDIUM", "LOW"];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export declare const JWT_COOKIE_NAME = "projectflow_token";
export declare const DEFAULT_PAGE = 1;
export declare const DEFAULT_LIMIT = 20;
export declare const MAX_LIMIT = 500;
//# sourceMappingURL=app.constants.d.ts.map