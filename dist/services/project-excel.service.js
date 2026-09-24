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
            { header: "Sprint Name", key: "name", width: 30 },
            { header: "Start Date (YYYY-MM-DD)", key: "start_date", width: 25 },
            { header: "End Date (YYYY-MM-DD)", key: "end_date", width: 25 },
            { header: "Status (PLANNED / ACTIVE / COMPLETED)", key: "status", width: 35 },
        ];
        sprintSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sprintSheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" },
        };
        sprintSheet.addRow({
            name: "Sprint 1 - Foundation",
            start_date: "2026-10-01",
            end_date: "2026-10-14",
            status: "ACTIVE",
        });
        sprintSheet.addRow({
            name: "Sprint 2 - Payment Gateway",
            start_date: "2026-10-15",
            end_date: "2026-10-28",
            status: "PLANNED",
        });
        // 3. Tickets Sheet
        const ticketSheet = workbook.addWorksheet("Tickets", {
            views: [{ showGridLines: true }],
        });
        ticketSheet.columns = [
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
            title: "Implement OAuth Login API",
            description: "Support Google and GitHub OAuth authentication flow.",
            status: "DONE",
            priority: "HIGH",
            estimation: "2d",
            sprint_name: "Sprint 1 - Foundation",
            assignee_email: "alice@projectflow.dev",
        });
        ticketSheet.addRow({
            title: "Setup PostgreSQL Schema & Migrations",
            description: "Prisma schema with indexes on foreign keys.",
            status: "IN_REVIEW",
            priority: "HIGH",
            estimation: "1.5d",
            sprint_name: "Sprint 1 - Foundation",
            assignee_email: "bob@projectflow.dev",
        });
        ticketSheet.addRow({
            title: "Build Kanban Board Drag-and-Drop",
            description: "Smooth dnd-kit columns with optimistic updates.",
            status: "TODO",
            priority: "MEDIUM",
            estimation: "3d",
            sprint_name: "Sprint 2 - Payment Gateway",
            assignee_email: "",
        });
        ticketSheet.addRow({
            title: "Write Swagger API Documentation",
            description: "Complete OpenAPI 3.0 documentation for all public endpoints.",
            status: "TODO",
            priority: "LOW",
            estimation: "4h",
            sprint_name: "", // Backlog ticket
            assignee_email: "",
        });
        await workbook.xlsx.write(res);
        res.end();
    },
    /**
     * Memory-efficient streaming export of an entire project to XLSX.
     * Streams row-by-row directly into Express response object without buffer accumulation in RAM.
     */
    async exportProject(projectId, userId, res) {
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
            include: {
                owner: { select: { id: true, full_name: true, email: true } },
            },
        });
        if (!project)
            throw (0, error_middleware_1.createError)("Project not found.", 404);
        const isOwner = project.created_by === userId;
        const membership = isOwner ? null : await member_repository_1.memberRepository.findMembership(userId, projectId);
        if (!isOwner && !membership) {
            throw (0, error_middleware_1.createError)("You do not have access to this project.", 403);
        }
        const safeFilename = `${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Export.xlsx`;
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
        infoSheet.addRow(["Property", "Value"]).commit();
        infoSheet.addRow(["Project Name", project.name]).commit();
        infoSheet.addRow(["Description", project.description || "N/A"]).commit();
        infoSheet.addRow(["Status", project.status]).commit();
        infoSheet.addRow(["Owner", `${project.owner.full_name} (${project.owner.email})`]).commit();
        infoSheet.addRow(["Created Date", project.created_at.toISOString().slice(0, 10)]).commit();
        infoSheet.commit();
        // 2. Sprints Sheet
        const sprintSheet = workbook.addWorksheet("Sprints");
        sprintSheet.addRow(["ID", "Sprint Name", "Start Date", "End Date", "Status"]).commit();
        const sprints = await prisma_1.default.sprint.findMany({
            where: { project_id: projectId },
            orderBy: { id: "asc" },
        });
        for (const s of sprints) {
            sprintSheet
                .addRow([
                s.id,
                s.name || `Sprint #${s.id}`,
                s.start_date.toISOString().slice(0, 10),
                s.end_date.toISOString().slice(0, 10),
                s.status,
            ])
                .commit();
        }
        sprintSheet.commit();
        // 3. Tickets Sheet (Streaming chunk-by-chunk with cursor pagination)
        const ticketSheet = workbook.addWorksheet("Tickets");
        ticketSheet
            .addRow([
            "ID",
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
        const CHUNK_SIZE = 500;
        let cursorId = undefined;
        let hasMore = true;
        while (hasMore) {
            const tickets = await prisma_1.default.ticket.findMany({
                where: { project_id: projectId },
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
                    t.title,
                    t.description || "",
                    t.status,
                    t.priority,
                    t.estimation || "",
                    t.sprint?.name || (t.sprint_id ? `Sprint #${t.sprint_id}` : "Backlog"),
                    t.assignee?.full_name || "Unassigned",
                    t.assignee?.email || "",
                    t.author?.full_name || "",
                    t.created_at.toISOString().slice(0, 10),
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
                            if (h.includes("name"))
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
                    const startDate = startVal ? new Date(startVal) : now;
                    const endDate = endVal ? new Date(endVal) : new Date(now.getTime() + 14 * 86400000);
                    sprintRows.push({
                        name: sName,
                        start_date: isNaN(startDate.getTime()) ? now : startDate,
                        end_date: isNaN(endDate.getTime()) ? new Date(now.getTime() + 14 * 86400000) : endDate,
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
                            if (h.includes("title"))
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