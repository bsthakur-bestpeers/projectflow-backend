export interface CreateSprintData {
    project_id: number;
    name?: string | null;
    start_date: Date;
    end_date: Date;
}
export interface UpdateSprintData {
    name?: string | null;
    start_date?: Date;
    end_date?: Date;
    status?: string;
}
export declare const sprintRepository: {
    create(data: CreateSprintData): Promise<{
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
    findById(id: number): Promise<{
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
    } | null>;
    findByProject(projectId: number): Promise<{
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
    findActiveByProject(projectId: number): Promise<{
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
    } | null>;
    findOverlapping(projectId: number, startDate: Date, endDate: Date, excludeSprintId?: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    } | null>;
    countByProject(projectId: number): Promise<number>;
    findLatestByEndDate(projectId: number): Promise<{
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
    } | null>;
    update(id: number, data: UpdateSprintData): Promise<{
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
    delete(id: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        name: string | null;
        status: string;
        project_id: number;
        start_date: Date;
        end_date: Date;
    }>;
    startSprint(sprintId: number, startDate?: Date, endDate?: Date): Promise<{
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
    completeSprint(sprintId: number, endDate?: Date): Promise<{
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
    cancelSprint(sprintId: number): Promise<{
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
//# sourceMappingURL=sprint.repository.d.ts.map