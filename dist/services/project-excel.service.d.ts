import { Response } from "express";
export declare const projectExcelService: {
    /**
     * Generates and streams a downloadable sample XLSX template with instructions & sample data.
     */
    generateSampleTemplate(res: Response): Promise<void>;
    /**
     * Memory-efficient streaming export of one or multiple projects to XLSX.
     * Streams row-by-row directly into Express response object without buffer accumulation in RAM.
     */
    exportProjects(projectIds: number[], userId: number, res: Response): Promise<void>;
    exportProject(projectId: number, userId: number, res: Response): Promise<void>;
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