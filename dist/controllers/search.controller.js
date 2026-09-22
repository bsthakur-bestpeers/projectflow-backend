"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
exports.searchController = {
    async search(req, res, next) {
        try {
            const userId = req.user.userId;
            const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
            if (!q) {
                return res.json({
                    success: true,
                    data: { projects: [], sprints: [], tickets: [] },
                });
            }
            // 1. Find user's accessible project IDs
            const userProjects = await prisma_1.default.project.findMany({
                where: {
                    OR: [
                        { created_by: userId },
                        { members: { some: { user_id: userId } } },
                    ],
                },
                select: { id: true, name: true, created_by: true },
            });
            const projectIds = userProjects.map((p) => p.id);
            const projectMap = new Map(userProjects.map((p) => [p.id, p]));
            if (projectIds.length === 0) {
                return res.json({
                    success: true,
                    data: { projects: [], sprints: [], tickets: [] },
                });
            }
            // Parse ticket ID if user searches "PF-12" or "12"
            let numericTicketId = null;
            const cleanKeyMatch = q.match(/^(?:pf-?)?(\d+)$/i);
            if (cleanKeyMatch) {
                numericTicketId = parseInt(cleanKeyMatch[1], 10);
            }
            // 2. Search Projects
            const matchedProjects = await prisma_1.default.project.findMany({
                where: {
                    id: { in: projectIds },
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { description: { contains: q, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    created_by: true,
                },
                take: 5,
            });
            const normalizedQ = q.replace(/spring/gi, "sprint").trim();
            const sprintNumberMatch = normalizedQ.match(/(?:sprint\s*#?|#)?(\d+)/i);
            // 3. Search Sprints
            const sprintOrConditions = [
                { name: { contains: q, mode: "insensitive" } },
            ];
            if (normalizedQ !== q) {
                sprintOrConditions.push({ name: { contains: normalizedQ, mode: "insensitive" } });
            }
            if (sprintNumberMatch) {
                const num = sprintNumberMatch[1];
                sprintOrConditions.push({ name: { contains: `Sprint ${num}`, mode: "insensitive" } });
            }
            const matchedSprints = await prisma_1.default.sprint.findMany({
                where: {
                    project_id: { in: projectIds },
                    OR: sprintOrConditions,
                },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    project_id: true,
                    start_date: true,
                    end_date: true,
                },
                take: 10,
            });
            // Sort sprints so exact / closer matches come first
            matchedSprints.sort((a, b) => {
                const aName = (a.name || "").toLowerCase();
                const bName = (b.name || "").toLowerCase();
                const target = normalizedQ.toLowerCase();
                const aExact = aName === target;
                const bExact = bName === target;
                if (aExact && !bExact)
                    return -1;
                if (!aExact && bExact)
                    return 1;
                const aStarts = aName.startsWith(target);
                const bStarts = bName.startsWith(target);
                if (aStarts && !bStarts)
                    return -1;
                if (!aStarts && bStarts)
                    return 1;
                return 0;
            });
            const sprintsWithProject = matchedSprints.slice(0, 5).map((s) => ({
                ...s,
                projectName: projectMap.get(s.project_id)?.name ?? `Project #${s.project_id}`,
            }));
            // 4. Search Tickets
            const ticketOrConditions = [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
            ];
            if (numericTicketId !== null) {
                ticketOrConditions.push({ id: numericTicketId });
            }
            const matchedTickets = await prisma_1.default.ticket.findMany({
                where: {
                    project_id: { in: projectIds },
                    OR: ticketOrConditions,
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    estimation: true,
                    project_id: true,
                    sprint_id: true,
                    assignee_id: true,
                    author_id: true,
                    assignee: {
                        select: { id: true, full_name: true, email: true },
                    },
                    sprint: {
                        select: { id: true, name: true, status: true },
                    },
                },
                take: 8,
            });
            // Filter tickets for non-owners: only show assigned to them or created by them (or all if owner)
            const visibleTickets = matchedTickets.filter((t) => {
                const project = projectMap.get(t.project_id);
                const isOwner = project?.created_by === userId;
                if (isOwner)
                    return true;
                return t.assignee_id === userId || t.author_id === userId;
            });
            const ticketsWithProject = visibleTickets.map((t) => ({
                ...t,
                projectName: projectMap.get(t.project_id)?.name ?? `Project #${t.project_id}`,
            }));
            return res.json({
                success: true,
                data: {
                    projects: matchedProjects,
                    sprints: sprintsWithProject,
                    tickets: ticketsWithProject,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=search.controller.js.map