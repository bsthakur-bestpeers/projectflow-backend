export interface CreateTicketData {
    project_id: number;
    sprint_id?: number | null;
    title: string;
    description?: string | null;
    status?: string;
    priority?: string;
    estimation?: string | null;
    author_id: number;
    assignee_id?: number | null;
    position?: number;
}
export interface UpdateTicketData {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    estimation?: string | null;
    assignee_id?: number | null;
    author_id?: number;
    sprint_id?: number | null;
    position?: number;
}
export interface MoveTicketData {
    status?: string;
    position?: number;
    sprint_id?: number | null;
}
export interface GetTicketsFilter {
    status?: string;
    priority?: string;
    assigneeId?: number;
    sprintId?: number | null;
    search?: string;
    page?: number;
    limit?: number;
}
export declare const ticketRepository: {
    create(data: CreateTicketData): Promise<{
        sprint: {
            id: number;
            name: string | null;
            status: string;
            start_date: Date;
            end_date: Date;
        } | null;
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        project_id: number;
        sprint_id: number | null;
        title: string;
        priority: string;
        estimation: string | null;
        position: number;
        author_id: number;
        assignee_id: number | null;
        author: {
            id: number;
            email: string;
            full_name: string;
        };
        assignee: {
            id: number;
            email: string;
            full_name: string;
        } | null;
    }>;
    findById(id: number): Promise<{
        sprint: {
            id: number;
            name: string | null;
            status: string;
            start_date: Date;
            end_date: Date;
        } | null;
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        project_id: number;
        sprint_id: number | null;
        title: string;
        priority: string;
        estimation: string | null;
        position: number;
        author_id: number;
        assignee_id: number | null;
        author: {
            id: number;
            email: string;
            full_name: string;
        };
        assignee: {
            id: number;
            email: string;
            full_name: string;
        } | null;
    } | null>;
    findByProject(projectId: number, filter?: GetTicketsFilter): Promise<{
        tickets: {
            sprint: {
                id: number;
                name: string | null;
                status: string;
                start_date: Date;
                end_date: Date;
            } | null;
            id: number;
            created_at: Date;
            updated_at: Date;
            description: string | null;
            status: string;
            project_id: number;
            sprint_id: number | null;
            title: string;
            priority: string;
            estimation: string | null;
            position: number;
            author_id: number;
            assignee_id: number | null;
            author: {
                id: number;
                email: string;
                full_name: string;
            };
            assignee: {
                id: number;
                email: string;
                full_name: string;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: number, data: UpdateTicketData): Promise<{
        sprint: {
            id: number;
            name: string | null;
            status: string;
            start_date: Date;
            end_date: Date;
        } | null;
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        project_id: number;
        sprint_id: number | null;
        title: string;
        priority: string;
        estimation: string | null;
        position: number;
        author_id: number;
        assignee_id: number | null;
        author: {
            id: number;
            email: string;
            full_name: string;
        };
        assignee: {
            id: number;
            email: string;
            full_name: string;
        } | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        project_id: number;
        sprint_id: number | null;
        title: string;
        priority: string;
        estimation: string | null;
        position: number;
        author_id: number;
        assignee_id: number | null;
    }>;
    moveTicket(ticketId: number, data: MoveTicketData, projectId: number): Promise<{
        sprint: {
            id: number;
            name: string | null;
            status: string;
            start_date: Date;
            end_date: Date;
        } | null;
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        project_id: number;
        sprint_id: number | null;
        title: string;
        priority: string;
        estimation: string | null;
        position: number;
        author_id: number;
        assignee_id: number | null;
        author: {
            id: number;
            email: string;
            full_name: string;
        };
        assignee: {
            id: number;
            email: string;
            full_name: string;
        } | null;
    }>;
    getRecentlyUpdated(userId: number, limit?: number): Promise<{
        sprint: {
            id: number;
            name: string | null;
            status: string;
            start_date: Date;
            end_date: Date;
        } | null;
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        project_id: number;
        sprint_id: number | null;
        title: string;
        priority: string;
        estimation: string | null;
        position: number;
        author_id: number;
        assignee_id: number | null;
        author: {
            id: number;
            email: string;
            full_name: string;
        };
        assignee: {
            id: number;
            email: string;
            full_name: string;
        } | null;
    }[]>;
    getAssignedToUser(userId: number, limit?: number): Promise<{
        sprint: {
            id: number;
            name: string | null;
            status: string;
            start_date: Date;
            end_date: Date;
        } | null;
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        project_id: number;
        sprint_id: number | null;
        title: string;
        priority: string;
        estimation: string | null;
        position: number;
        author_id: number;
        assignee_id: number | null;
        author: {
            id: number;
            email: string;
            full_name: string;
        };
        assignee: {
            id: number;
            email: string;
            full_name: string;
        } | null;
    }[]>;
};
//# sourceMappingURL=ticket.repository.d.ts.map