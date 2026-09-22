export interface CreateProjectData {
    name: string;
    description?: string;
    created_by: number;
}
export interface UpdateProjectData {
    name?: string;
    description?: string;
    status?: string;
}
export declare const projectRepository: {
    createWithOwnerMembership(data: CreateProjectData): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            members: number;
            sprints: number;
            tickets: number;
        };
        name: string;
        description: string | null;
        status: string;
        created_by: number;
        owner: {
            id: number;
            email: string;
            full_name: string;
        };
    }>;
    findById(id: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            members: number;
            sprints: number;
            tickets: number;
        };
        name: string;
        description: string | null;
        status: string;
        created_by: number;
        owner: {
            id: number;
            email: string;
            full_name: string;
        };
    } | null>;
    findByName(name: string): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            members: number;
            sprints: number;
            tickets: number;
        };
        name: string;
        description: string | null;
        status: string;
        created_by: number;
        owner: {
            id: number;
            email: string;
            full_name: string;
        };
    } | null>;
    findByMemberUserId(userId: number, page?: number, limit?: number): Promise<{
        projects: {
            id: number;
            created_at: Date;
            updated_at: Date;
            _count: {
                members: number;
                sprints: number;
                tickets: number;
            };
            name: string;
            description: string | null;
            status: string;
            created_by: number;
            owner: {
                id: number;
                email: string;
                full_name: string;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: number, data: UpdateProjectData): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        _count: {
            members: number;
            sprints: number;
            tickets: number;
        };
        name: string;
        description: string | null;
        status: string;
        created_by: number;
        owner: {
            id: number;
            email: string;
            full_name: string;
        };
    }>;
    delete(id: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        status: string;
        created_by: number;
    }>;
    getTicketSummary(projectId: number): Promise<{
        total: number;
        TODO: number;
        IN_PROGRESS: number;
        IN_REVIEW: number;
        DONE: number;
    }>;
};
//# sourceMappingURL=project.repository.d.ts.map