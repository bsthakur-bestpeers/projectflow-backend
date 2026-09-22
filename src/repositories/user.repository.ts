import prisma from "../db/prisma";

export interface CreateUserData {
  full_name: string;
  email: string;
  password_hash: string;
  role?: string;
  approval_status?: string;
  is_active?: boolean;
}

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        full_name: true,
        email: true,
        password_hash: true,
        role: true,
        approval_status: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        approval_status: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  async create(data: CreateUserData) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        approval_status: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  async findAllActive() {
    return prisma.user.findMany({
      where: {
        is_active: true,
        role: "USER",
      },
      select: {
        id: true,
        full_name: true,
        email: true,
      },
      orderBy: { full_name: "asc" },
    });
  },

  async countTotal() {
    return prisma.user.count();
  },

  async findAllUsers(filter?: { approval_status?: string; role?: string }) {
    const where: Record<string, unknown> = {};
    if (filter?.approval_status) where.approval_status = filter.approval_status;
    if (filter?.role) where.role = filter.role;

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        approval_status: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: [{ approval_status: "desc" }, { created_at: "desc" }],
    });
  },

  async updateApprovalStatus(id: number, approval_status: string, is_active: boolean) {
    return prisma.user.update({
      where: { id },
      data: { approval_status, is_active },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        approval_status: true,
        is_active: true,
        updated_at: true,
      },
    });
  },

  async updateRole(id: number, role: string) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        approval_status: true,
        is_active: true,
        updated_at: true,
      },
    });
  },

  async updateProfile(id: number, data: { full_name?: string; password_hash?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        approval_status: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  async findByResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
      },
    });
  },

  async updateResetToken(id: number, reset_token: string | null, reset_token_expires: Date | null) {
    return prisma.user.update({
      where: { id },
      data: { reset_token, reset_token_expires },
    });
  },
};
