import { Response } from "express";
export declare const projectExcelService: {
    /**
     * Generates and streams a downloadable sample XLSX template with instructions & sample data.
     */
    /**
     * Generates and streams a downloadable sample XLSX template for a single project.
     * Project-specific structure: Sheet 1 (Project Info), Sheet 2 (Sprints), Sheet 3 (Tickets).
     */
    generateSampleTemplate(res: Response): Promise<void>;
    /**
     * Generates a beautifully formatted, project-specific XLSX export for a single project.
     * All sheets (Project Info, Sprints, Tickets) are dedicated to this project.
     */
    exportProject(projectId: number, userId: number, res: Response): Promise<void>;
    exportProjects(projectIds: number[], userId: number, res: Response): Promise<void>;
    /**
     * Imports a new Project or into an existing project from an uploaded XLSX file.
     * Reads data and writes to the DB in chunked transactions to avoid memory exhaustion.
     */
    importProjectFromXlsx(userId: number, filePath: string, existingProjectId?: number): Promise<{
        project: {
            id: number;
            name: string;
        };
        stats: {
            sprintsCount: number;
            ticketsCount: number;
        };
    }>;
};
//# sourceMappingURL=project-excel.service.d.ts.map