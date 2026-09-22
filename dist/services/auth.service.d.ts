export declare const authService: {
    register(full_name: string, email: string, password: string): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: number;
            email: string;
            full_name: string;
            role: string;
            approval_status: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
        };
        token: string;
    }>;
    getMe(userId: number): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
};
//# sourceMappingURL=auth.service.d.ts.map