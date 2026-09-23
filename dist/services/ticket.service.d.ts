import { CreateTicketData, UpdateTicketData, GetTicketsFilter } from "../repositories/ticket.repository";
export declare const ticketService: {
    createTicket(projectId: number, userId: number, data: Omit<CreateTicketData, "project_id">): Promise<{
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
    getTickets(projectId: number, userId: number, filter: GetTicketsFilter): Promise<{
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
    getTicketById(ticketId: number, userId: number): Promise<{
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
    updateTicket(ticketId: number, userId: number, data: UpdateTicketData): Promise<{
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
    deleteTicket(ticketId: number, userId: number): Promise<{
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
    moveTicket(ticketId: number, userId: number, data: {
        status?: string;
        position?: number;
        sprintId?: number | null;
    }): Promise<{
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
    getDashboardData(userId: number): Promise<{
        assignedTickets: {
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
        recentTickets: {
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
    }>;
};
//# sourceMappingURL=ticket.service.d.ts.map