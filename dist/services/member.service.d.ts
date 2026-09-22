export declare const memberService: {
    getMembers(projectId: number, userId: number): Promise<{
        joined_at: Date;
        is_owner: boolean;
        id: number;
        email: string;
        full_name: string;
        is_active: boolean;
    }[]>;
    addMember(projectId: number, requestingUserId: number, targetEmail: string): Promise<{
        joined_at: Date;
        is_owner: boolean;
        id: number;
        email: string;
        full_name: string;
    }>;
    removeMember(projectId: number, requestingUserId: number, targetUserId: number): Promise<void>;
};
//# sourceMappingURL=member.service.d.ts.map