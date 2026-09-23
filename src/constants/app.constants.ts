export const APP_NAME = "ProjectFlow";
export const APP_VERSION = "v1.0.2";

export const PROJECT_STATUS = ["ACTIVE", "COMPLETED", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

export const SPRINT_STATUS = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
export type SprintStatus = (typeof SPRINT_STATUS)[number];

export const TICKET_STATUS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
export type TicketStatus = (typeof TICKET_STATUS)[number];

export const TICKET_PRIORITIES = ["HIGHEST", "HIGH", "MEDIUM", "LOW", "LOWEST"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const JWT_COOKIE_NAME = "projectflow_token";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 500;
