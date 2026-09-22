export declare const memberRepository: {
    findMembership(userId: number, projectId: number): Promise<{
        id: number;
        created_at: Date;
        user_id: number;
        project_id: number;
    } | null>;
    addMember(userId: number, projectId: number): Promise<{
        user: {
            id: number;
            email: string;
            full_name: string;
        };
    } & {
        id: number;
        created_at: Date;
        user_id: number;
        project_id: number;
    }>;
    removeMember(userId: number, projectId: number): Promise<{
        id: number;
        created_at: Date;
        user_id: number;
        project_id: number;
    }>;
    getProjectMembers(projectId: number): Promise<({
        user: {
            id: number;
            email: string;
            full_name: string;
            is_active: boolean;
        };
    } & {
        id: number;
        created_at: Date;
        user_id: number;
        project_id: number;
    })[]>;
};
//# sourceMappingURL=member.repository.d.ts.map