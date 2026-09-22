import { UpdateProjectData } from "../repositories/project.repository";
export declare const projectService: {
    createProject(userId: number, name: string, description?: string): Promise<{
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
    getProjects(userId: number, page: number, limit: number): Promise<{
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
    getProjectById(projectId: number, userId: number): Promise<{
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
    updateProject(projectId: number, userId: number, data: UpdateProjectData): Promise<{
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
    deleteProject(projectId: number, userId: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        status: string;
        created_by: number;
    }>;
    getProjectSummary(projectId: number, userId: number): Promise<{
        project: {
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
        };
        summary: {
            total: number;
            TODO: number;
            IN_PROGRESS: number;
            IN_REVIEW: number;
            DONE: number;
        };
    }>;
    isOwner(project: {
        created_by: number;
    }, userId: number): boolean;
};
//# sourceMappingURL=project.service.d.ts.map