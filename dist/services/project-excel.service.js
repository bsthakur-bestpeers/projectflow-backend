"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectExcelService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = __importDefault(require("../db/prisma"));
const error_middleware_1 = require("../middleware/error.middleware");
const project_repository_1 = require("../repositories/project.repository");
const member_repository_1 = require("../repositories/member.repository");
/**
 * Parses diverse Excel date representations including:
 * - Excel numeric serial dates (e.g. 46286 -> 2026-09-21)
 * - Serial number strings (e.g. "46286", "46286.5")
 * - Slash formats (e.g. "2026/9/25", "2026/09/25", "9/25/2026", "25/9/2026")
 * - Standard ISO/dash formats (e.g. "2026-09-17")
 * - Cell objects with result/text/date
 * - Native Date objects
 */
function parseExcelDate(val, fallback = new Date()) {
    if (!val)
        return fallback;
    if (val && typeof val === "object" && !(val instanceof Date)) {
        if ("result" in val && val.result !== undefined)
            val = val.result;
        else if ("text" in val && val.text !== undefined)
            val = val.text;
        else if ("date" in val && val.date !== undefined)
            val = val.date;
    }
    if (val instanceof Date)
        return isNaN(val.getTime()) ? fallback : val;
    if (typeof val === "number") {
        if (val > 1000 && val < 100000) {
            const utcDays = Math.floor(val - 25569);
            const utcValue = utcDays * 86400 * 1000;
            const d = new Date(utcValue);
            return isNaN(d.getTime()) ? fallback : d;
        }
        const d = new Date(val);
        return isNaN(d.getTime()) ? fallback : d;
    }
    if (typeof val === "string") {
        const s = val.trim();
        if (!s)
            return fallback;
        if (/^\d{4,6}(\.\d+)?$/.test(s)) {
            const num = Number(s);
            if (num > 1000 && num < 100000) {
                const utcDays = Math.floor(num - 25569);
                const utcValue = utcDays * 86400 * 1000;
                const d = new Date(utcValue);
                return isNaN(d.getTime()) ? fallback : d;
            }
        }
        const parts = s.split(/[\/\-\.]/);
        if (parts.length === 3) {
            const [p1, p2, p3] = parts.map((p) => parseInt(p, 10));
            if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3)) {
                if (p1 > 1900) {
                    const d = new Date(Date.UTC(p1, p2 - 1, p3));
                    if (!isNaN(d.getTime()))
                        return d;
                }
                else if (p3 > 1900) {
                    const month = (p1 > 12 ? p2 : p1) - 1;
                    const day = p1 > 12 ? p1 : p2;
                    const d = new Date(Date.UTC(p3, month, day));
                    if (!isNaN(d.getTime()))
                        return d;
                }
            }
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? fallback : d;
    }
    return fallback;
}
function formatDateStr(d) {
    if (!d)
        return "";
    const dateObj = d instanceof Date ? d : new Date(d);
    if (isNaN(dateObj.getTime()))
        return String(d);
    return dateObj.toISOString().slice(0, 10);
}
exports.projectExcelService = {
    /**
     * Generates and streams a downloadable sample XLSX template with instructions & sample data.
     */
    async generateSampleTemplate(res) {
        res.setHeader("Content-Disposition", 'attachment; filename="ProjectFlow_Sample_Template.xlsx"');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        const workbook = new exceljs_1.default.Workbook();
        // 1. Project Info Sheet
        const infoSheet = workbook.addWorksheet("Project Info", {
            views: [{ showGridLines: true }],
        });
        infoSheet.columns = [
            { header: "Project Name", key: "name", width: 30 },
            { header: "Description", key: "description", width: 50 },
        ];
        infoSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        infoSheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" }, // Indigo
        };
        infoSheet.addRow({
            name: "Sample Fintech Platform",
            description: "Core banking platform modern architecture with microservices.",
        });
        // 2. Sprints Sheet
        const sprintSheet = workbook.addWorksheet("Sprints", {
            views: [{ showGridLines: true }],
        });
        sprintSheet.columns = [
            { header: "Project Name", key: "project_name", width: 25 },
            { header: "Sprint Name", key: "name", width: 30 },
            { header: "Start Date (YYYY-MM-DD)", key: "start_date", width: 25, style: { numFmt: "yyyy-mm-dd" } },
            { header: "End Date (YYYY-MM-DD)", key: "end_date", width: 25, style: { numFmt: "yyyy-mm-dd" } },
            { header: "Status (PLANNED / ACTIVE / COMPLETED)", key: "status", width: 35 },
        ];
        sprintSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sprintSheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" },
        };
        sprintSheet.addRow({
            project_name: "Sample Fintech Platform",
            name: "Sprint 1 - Foundation",
            start_date: "2026-10-01",
            end_date: "2026-10-14",
            status: "ACTIVE",
        });
        sprintSheet.addRow({
            project_name: "Sample Fintech Platform",
            name: "Sprint 2 - Payment Gateway",
            start_date: "2026-10-15",
            end_date: "2026-10-28",
            status: "PLANNED",
        });
        sprintSheet.addRow({
            project_name: "E-Commerce Store",
            name: "Sprint 1 - Checkout Flow",
            start_date: "2026-10-01",
            end_date: "2026-10-14",
            status: "ACTIVE",
        });
        // 3. Tickets Sheet
        const ticketSheet = workbook.addWorksheet("Tickets", {
            views: [{ showGridLines: true }],
        });
        ticketSheet.columns = [
            { header: "Project Name", key: "project_name", width: 25 },
            { header: "Title", key: "title", width: 35 },
            { header: "Description", key: "description", width: 45 },
            { header: "Status (TODO / IN_PROGRESS / IN_REVIEW / DONE)", key: "status", width: 40 },
            { header: "Priority (HIGH / MEDIUM / LOW)", key: "priority", width: 30 },
            { header: "Estimation (e.g. 2h, 1.5d)", key: "estimation", width: 25 },
            { header: "Sprint Name (Leave empty for Backlog)", key: "sprint_name", width: 35 },
            { header: "Assignee Email", key: "assignee_email", width: 30 },
        ];
        ticketSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        ticketSheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" },
        };
        ticketSheet.addRow({
            project_name: "Sample Fintech Platform",
            title: "Implement OAuth Login API",
            description: "Support Google and GitHub OAuth authentication flow.",
            status: "DONE",
            priority: "HIGH",
            estimation: "2d",
            sprint_name: "Sprint 1 - Foundation",
            assignee_email: "alice@projectflow.dev",
        });
        ticketSheet.addRow({
            project_name: "Sample Fintech Platform",
            title: "Write Swagger API Documentation",
            description: "Complete OpenAPI 3.0 documentation for all public endpoints.",
            status: "TODO",
            priority: "LOW",
            estimation: "4h",
            sprint_name: "", // Backlog ticket for Sample Fintech Platform
            assignee_email: "",
        });
        ticketSheet.addRow({
            project_name: "Sample Fintech Platform",
            title: "Build Kanban Board Drag-and-Drop",
            description: "Smooth dnd-kit columns with optimistic updates.",
            status: "TODO",
            priority: "MEDIUM",
            estimation: "3d",
            sprint_name: "Sprint 2 - Payment Gateway",
            assignee_email: "",
        });
        ticketSheet.addRow({
            project_name: "E-Commerce Store",
            title: "Build Product Catalog UI",
            description: "Responsive grid with filtering and search.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            estimation: "3d",
            sprint_name: "Sprint 1 - Checkout Flow",
            assignee_email: "bob@projectflow.dev",
        });
        ticketSheet.addRow({
            project_name: "E-Commerce Store",
            title: "Cart Abandonment Email System",
            description: "Trigger automated follow-up emails after 2 hours of inactivity.",
            status: "TODO",
            priority: "MEDIUM",
            estimation: "1.5d",
            sprint_name: "", // Backlog ticket for E-Commerce Store
            assignee_email: "",
        });
        await workbook.xlsx.write(res);
        res.end();
    },
    /**
     * Memory-efficient streaming export of one or multiple projects to XLSX.
     * Streams row-by-row directly into Express response object without buffer accumulation in RAM.
     */
    async exportProjects(projectIds, userId, res) {
        const projects = await prisma_1.default.project.findMany({
            where: {
                id: { in: projectIds },
                OR: [
                    { created_by: userId },
                    { members: { some: { user_id: userId } } },
                ],
            },
            include: {
                owner: { select: { id: true, full_name: true, email: true } },
            },
            orderBy: { id: "asc" },
        });
        if (projects.length === 0)
            throw (0, error_middleware_1.createError)("No accessible projects found.", 404);
        const safeFilename = projects.length === 1
            ? `${projects[0].name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Export.xlsx`
            : `Projects_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        // Using streaming WorkbookWriter: writes directly to response stream
        const workbook = new exceljs_1.default.stream.xlsx.WorkbookWriter({
            stream: res,
            useStyles: true,
            useSharedStrings: true,
        });
        // 1. Project Info Sheet
        const infoSheet = workbook.addWorksheet("Project Info");
        if (projects.length === 1) {
            const project = projects[0];
            infoSheet.addRow(["Property", "Value"]).commit();
            infoSheet.addRow(["Project Name", project.name]).commit();
            infoSheet.addRow(["Description", project.description || "N/A"]).commit();
            infoSheet.addRow(["Owner", `${project.owner.full_name} (${project.owner.email})`]).commit();
            infoSheet.addRow(["Created Date", formatDateStr(project.created_at)]).commit();
        }
        else {
            infoSheet.addRow(["ID", "Project Name", "Description", "Owner", "Created Date"]).commit();
            infoSheet.getColumn(5).numFmt = "yyyy-mm-dd";
            for (const p of projects) {
                infoSheet.addRow([
                    p.id,
                    p.name,
                    p.description || "N/A",
                    `${p.owner.full_name} (${p.owner.email})`,
                    formatDateStr(p.created_at),
                ]).commit();
            }
        }
        infoSheet.commit();
        // 2. Sprints Sheet
        const sprintSheet = workbook.addWorksheet("Sprints");
        sprintSheet.addRow(["ID", "Project Name", "Sprint Name", "Start Date", "End Date", "Status"]).commit();
        sprintSheet.getColumn(4).numFmt = "yyyy-mm-dd";
        sprintSheet.getColumn(5).numFmt = "yyyy-mm-dd";
        const sprints = await prisma_1.default.sprint.findMany({
            where: { project_id: { in: projects.map((p) => p.id) } },
            include: { project: { select: { name: true } } },
            orderBy: [{ project_id: "asc" }, { id: "asc" }],
        });
        const nowTs = Date.now();
        for (const s of sprints) {
            let sprintStatus = s.status;
            if (s.status !== "CANCELLED" && s.status !== "COMPLETED") {
                const startTs = new Date(s.start_date).getTime();
                const endOfDayTs = new Date(s.end_date).setHours(23, 59, 59, 999);
                if (nowTs >= startTs && nowTs <= endOfDayTs) {
                    sprintStatus = "ACTIVE";
                }
                else if (nowTs > endOfDayTs) {
                    sprintStatus = "COMPLETED";
                }
                else {
                    sprintStatus = "PLANNED";
                }
            }
            sprintSheet
                .addRow([
                s.id,
                s.project?.name || `Project #${s.project_id}`,
                s.name || `Sprint #${s.id}`,
                formatDateStr(s.start_date),
                formatDateStr(s.end_date),
                sprintStatus,
            ])
                .commit();
        }
        sprintSheet.commit();
        // 3. Tickets Sheet (Streaming chunk-by-chunk with cursor pagination across all selected projects)
        const ticketSheet = workbook.addWorksheet("Tickets");
        ticketSheet
            .addRow([
            "ID",
            "Project Name",
            "Title",
            "Description",
            "Status",
            "Priority",
            "Estimation",
            "Sprint Name",
            "Assignee Name",
            "Assignee Email",
            "Author",
            "Created At",
        ])
            .commit();
        ticketSheet.getColumn(12).numFmt = "yyyy-mm-dd";
        const CHUNK_SIZE = 500;
        const projectMap = new Map();
        projects.forEach((p) => projectMap.set(p.id, p.name));
        let cursorId = undefined;
        let hasMore = true;
        while (hasMore) {
            const tickets = await prisma_1.default.ticket.findMany({
                where: { project_id: { in: projects.map((p) => p.id) } },
                take: CHUNK_SIZE,
                skip: cursorId ? 1 : 0,
                cursor: cursorId ? { id: cursorId } : undefined,
                orderBy: { id: "asc" },
                include: {
                    sprint: { select: { name: true, id: true } },
                    assignee: { select: { full_name: true, email: true } },
                    author: { select: { full_name: true, email: true } },
                },
            });
            if (tickets.length === 0)
                break;
            for (const t of tickets) {
                ticketSheet
                    .addRow([
                    t.id,
                    projectMap.get(t.project_id) || `Project #${t.project_id}`,
                    t.title,
                    t.description || "",
                    t.status,
                    t.priority,
                    t.estimation || "",
                    t.sprint?.name || (t.sprint_id ? `Sprint #${t.sprint_id}` : "Backlog"),
                    t.assignee?.full_name || "Unassigned",
                    t.assignee?.email || "",
                    t.author?.full_name || "",
                    formatDateStr(t.created_at),
                ])
                    .commit();
            }
            cursorId = tickets[tickets.length - 1].id;
            if (tickets.length < CHUNK_SIZE) {
                hasMore = false;
            }
        }
        ticketSheet.commit();
        await workbook.commit();
    },
    async exportProject(projectId, userId, res) {
        return this.exportProjects([projectId], userId, res);
    },
    /**
     * Imports a new Project or into an existing project from an uploaded XLSX file.
     * Reads data and writes to the DB in chunked transactions to avoid memory exhaustion.
     */
    async importProjectFromXlsx(userId, filePath, existingProjectId) {
        try {
            const workbook = new exceljs_1.default.Workbook();
            await workbook.xlsx.readFile(filePath);
            // Sheet 1: Project Info
            let targetProjectId = existingProjectId;
            let projectName = "Imported Project";
            let projectDesc = "";
            const infoSheet = workbook.getWorksheet("Project Info");
            if (infoSheet) {
                // Check row 2 (header in row 1, values in row 2) or Property/Value style
                const row1Prop = String(infoSheet.getRow(1).getCell(1).value || "").toLowerCase();
                if (row1Prop.includes("property")) {
                    // Key-Value format
                    infoSheet.eachRow((r, rowNumber) => {
                        if (rowNumber > 1) {
                            const k = String(r.getCell(1).value || "").toLowerCase();
                            const v = String(r.getCell(2).value || "").trim();
                            if (k.includes("name") && v)
                                projectName = v;
                            if (k.includes("desc") && v)
                                projectDesc = v;
                        }
                    });
                }
                else {
                    // Column header format
                    const nameVal = infoSheet.getRow(2).getCell(1).value;
                    const descVal = infoSheet.getRow(2).getCell(2).value;
                    if (nameVal)
                        projectName = String(nameVal).trim();
                    if (descVal)
                        projectDesc = String(descVal).trim();
                }
            }
            if (!targetProjectId) {
                // Creating a new project
                let finalName = projectName;
                const existing = await project_repository_1.projectRepository.findByName(finalName);
                if (existing) {
                    finalName = `${projectName} (${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
                }
                const createdProject = await project_repository_1.projectRepository.createWithOwnerMembership({
                    name: finalName,
                    description: projectDesc || "Imported from Excel file.",
                    created_by: userId,
                });
                targetProjectId = createdProject.id;
            }
            else {
                // Verify access to existing project
                const project = await prisma_1.default.project.findUnique({ where: { id: targetProjectId } });
                if (!project)
                    throw (0, error_middleware_1.createError)("Project not found.", 404);
                if (project.created_by !== userId) {
                    throw (0, error_middleware_1.createError)("Only the project owner can import data into this project.", 403);
                }
            }
            // Sheet 2: Sprints
            const sprintNameMap = new Map();
            let sprintsCount = 0;
            // Also index existing sprints of the target project
            const existingSprints = await prisma_1.default.sprint.findMany({
                where: { project_id: targetProjectId },
            });
            existingSprints.forEach((s) => {
                if (s.name)
                    sprintNameMap.set(s.name.toLowerCase().trim(), s.id);
                sprintNameMap.set(`sprint #${s.id}`.toLowerCase(), s.id);
            });
            const sprintSheet = workbook.getWorksheet("Sprints");
            if (sprintSheet) {
                const sprintRows = [];
                let headerMap = {};
                sprintSheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) {
                        row.eachCell((cell, colNumber) => {
                            const h = String(cell.value || "").toLowerCase();
                            if (h.includes("sprint") && h.includes("name"))
                                headerMap["name"] = colNumber;
                            else if (h.includes("project"))
                                headerMap["project"] = colNumber;
                            else if (h.includes("name") && !headerMap["name"])
                                headerMap["name"] = colNumber;
                            else if (h.includes("start"))
                                headerMap["start"] = colNumber;
                            else if (h.includes("end"))
                                headerMap["end"] = colNumber;
                            else if (h.includes("status"))
                                headerMap["status"] = colNumber;
                        });
                        return;
                    }
                    const sName = String(row.getCell(headerMap["name"] || 1).value || "").trim();
                    if (!sName)
                        return;
                    const startVal = row.getCell(headerMap["start"] || 2).value;
                    const endVal = row.getCell(headerMap["end"] || 3).value;
                    const statusVal = String(row.getCell(headerMap["status"] || 4).value || "").trim().toUpperCase();
                    const now = new Date();
                    const startDate = parseExcelDate(startVal, now);
                    const endDate = parseExcelDate(endVal, new Date(now.getTime() + 14 * 86400000));
                    sprintRows.push({
                        name: sName,
                        start_date: startDate,
                        end_date: endDate,
                        status: ["PLANNED", "ACTIVE", "COMPLETED"].includes(statusVal) ? statusVal : "PLANNED",
                    });
                });
                // Insert new sprints in batches
                for (const spData of sprintRows) {
                    const key = spData.name.toLowerCase().trim();
                    if (!sprintNameMap.has(key)) {
                        const created = await prisma_1.default.sprint.create({
                            data: {
                                project_id: targetProjectId,
                                name: spData.name,
                                start_date: spData.start_date,
                                end_date: spData.end_date,
                                status: spData.status,
                            },
                        });
                        sprintNameMap.set(key, created.id);
                        sprintsCount++;
                    }
                }
            }
            // Sheet 3: Tickets (Process and insert in chunks)
            const ticketSheet = workbook.getWorksheet("Tickets");
            let ticketsCount = 0;
            if (ticketSheet) {
                let ticketHeaderMap = {};
                const rawTicketList = [];
                ticketSheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) {
                        row.eachCell((cell, colNumber) => {
                            const h = String(cell.value || "").toLowerCase();
                            if (h.includes("project"))
                                ticketHeaderMap["project"] = colNumber;
                            else if (h.includes("title"))
                                ticketHeaderMap["title"] = colNumber;
                            else if (h.includes("desc"))
                                ticketHeaderMap["desc"] = colNumber;
                            else if (h.includes("status"))
                                ticketHeaderMap["status"] = colNumber;
                            else if (h.includes("prior"))
                                ticketHeaderMap["priority"] = colNumber;
                            else if (h.includes("estim"))
                                ticketHeaderMap["estimation"] = colNumber;
                            else if (h.includes("sprint"))
                                ticketHeaderMap["sprint"] = colNumber;
                            else if (h.includes("email") || h.includes("assignee"))
                                ticketHeaderMap["assignee"] = colNumber;
                        });
                        return;
                    }
                    const title = String(row.getCell(ticketHeaderMap["title"] || 1).value || "").trim();
                    if (!title)
                        return;
                    const desc = String(row.getCell(ticketHeaderMap["desc"] || 2).value || "").trim();
                    const rawStatus = String(row.getCell(ticketHeaderMap["status"] || 3).value || "").trim().toUpperCase();
                    const rawPriority = String(row.getCell(ticketHeaderMap["priority"] || 4).value || "").trim().toUpperCase();
                    const estimation = String(row.getCell(ticketHeaderMap["estimation"] || 5).value || "").trim();
                    const sprintName = String(row.getCell(ticketHeaderMap["sprint"] || 6).value || "").trim();
                    const assigneeEmail = String(row.getCell(ticketHeaderMap["assignee"] || 7).value || "").trim().toLowerCase();
                    const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
                    const validPriorities = ["HIGH", "MEDIUM", "LOW"];
                    const status = validStatuses.includes(rawStatus) ? rawStatus : "TODO";
                    const priority = validPriorities.includes(rawPriority) ? rawPriority : "MEDIUM";
                    rawTicketList.push({
                        title,
                        description: desc || null,
                        status,
                        priority,
                        estimation: estimation || null,
                        sprintName,
                        assigneeEmail,
                    });
                });
                // Pre-fetch all project members and emails to map assignees
                const users = await prisma_1.default.user.findMany({
                    select: { id: true, email: true },
                });
                const userEmailMap = new Map();
                users.forEach((u) => userEmailMap.set(u.email.toLowerCase(), u.id));
                // Process tickets in chunks of 100 to prevent large memory overhead & avoid query timeouts
                const CHUNK_SIZE = 100;
                for (let i = 0; i < rawTicketList.length; i += CHUNK_SIZE) {
                    const slice = rawTicketList.slice(i, i + CHUNK_SIZE);
                    const chunkData = [];
                    for (let posIdx = 0; posIdx < slice.length; posIdx++) {
                        const item = slice[posIdx];
                        let sprintId = null;
                        if (item.sprintName) {
                            const matchedId = sprintNameMap.get(item.sprintName.toLowerCase().trim());
                            if (matchedId)
                                sprintId = matchedId;
                        }
                        let assigneeId = null;
                        if (item.assigneeEmail && userEmailMap.has(item.assigneeEmail)) {
                            assigneeId = userEmailMap.get(item.assigneeEmail);
                            // Ensure membership
                            await member_repository_1.memberRepository.addMember(assigneeId, targetProjectId).catch(() => { });
                        }
                        chunkData.push({
                            project_id: targetProjectId,
                            sprint_id: sprintId,
                            title: item.title,
                            description: item.description,
                            status: item.status,
                            priority: item.priority,
                            estimation: item.estimation,
                            author_id: userId,
                            assignee_id: assigneeId,
                            position: i + posIdx,
                        });
                    }
                    if (chunkData.length > 0) {
                        await prisma_1.default.ticket.createMany({
                            data: chunkData,
                        });
                        ticketsCount += chunkData.length;
                    }
                }
            }
            const finalProj = await prisma_1.default.project.findUnique({
                where: { id: targetProjectId },
                select: { id: true, name: true },
            });
            return {
                project: finalProj || { id: targetProjectId, name: projectName },
                stats: { sprintsCount, ticketsCount },
            };
        }
        finally {
            // Ensure temp file is cleaned up from disk
            try {
                if (filePath && fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            catch (cleanupErr) {
                console.warn("Failed to delete temp upload file:", cleanupErr);
            }
        }
    },
};
//# sourceMappingURL=project-excel.service.js.map