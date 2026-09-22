import { CreateSprintData, UpdateSprintData } from "../repositories/sprint.repository";
export declare const sprintService: {
    createSprint(projectId: number, userId: number, data: Omit<CreateSprintData, "project_id">): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            tickets: number;
        };
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }>;
    getSprints(projectId: number, userId: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            tickets: number;
        };
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }[]>;
    getSprintById(sprintId: number, userId: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            tickets: number;
        };
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }>;
    updateSprint(sprintId: number, userId: number, data: UpdateSprintData): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            tickets: number;
        };
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }>;
    deleteSprint(sprintId: number, userId: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }>;
    startSprint(sprintId: number, userId: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            tickets: number;
        };
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }>;
    completeSprint(sprintId: number, userId: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            tickets: number;
        };
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }>;
};
//# sourceMappingURL=sprint.service.d.ts.map