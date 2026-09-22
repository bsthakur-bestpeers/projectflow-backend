export interface CreateUserData {
    full_name: string;
    email: string;
    password_hash: string;
    role?: string;
    approval_status?: string;
    is_active?: boolean;
}
export declare const userRepository: {
    findByEmail(email: string): Promise<{
        id: number;
        email: string;
        full_name: string;
        password_hash: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    } | null>;
    findById(id: number): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    } | null>;
    create(data: CreateUserData): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    findAllActive(): Promise<{
        id: number;
        email: string;
        full_name: string;
    }[]>;
    countTotal(): Promise<number>;
    findAllUsers(filter?: {
        approval_status?: string;
        role?: string;
    }): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }[]>;
    updateApprovalStatus(id: number, approval_status: string, is_active: boolean): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        updated_at: Date;
    }>;
    updateRole(id: number, role: string): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        updated_at: Date;
    }>;
    updateProfile(id: number, data: {
        full_name?: string;
        password_hash?: string;
    }): Promise<{
        id: number;
        email: string;
        full_name: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    findByResetToken(token: string): Promise<{
        id: number;
        email: string;
        full_name: string;
        password_hash: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        reset_token: string | null;
        reset_token_expires: Date | null;
        created_at: Date;
        updated_at: Date;
    } | null>;
    updateResetToken(id: number, reset_token: string | null, reset_token_expires: Date | null): Promise<{
        id: number;
        email: string;
        full_name: string;
        password_hash: string;
        role: string;
        approval_status: string;
        is_active: boolean;
        reset_token: string | null;
        reset_token_expires: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
};
//# sourceMappingURL=user.repository.d.ts.map