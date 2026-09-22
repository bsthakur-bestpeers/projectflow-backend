"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
exports.userRepository = {
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({
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
    async findById(id) {
        return prisma_1.default.user.findUnique({
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
    async create(data) {
        return prisma_1.default.user.create({
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
        return prisma_1.default.user.findMany({
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
        return prisma_1.default.user.count();
    },
    async findAllUsers(filter) {
        const where = {};
        if (filter?.approval_status)
            where.approval_status = filter.approval_status;
        if (filter?.role)
            where.role = filter.role;
        return prisma_1.default.user.findMany({
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
    async updateApprovalStatus(id, approval_status, is_active) {
        return prisma_1.default.user.update({
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
    async updateRole(id, role) {
        return prisma_1.default.user.update({
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
    async updateProfile(id, data) {
        return prisma_1.default.user.update({
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
    async findByResetToken(token) {
        return prisma_1.default.user.findFirst({
            where: {
                reset_token: token,
                reset_token_expires: {
                    gt: new Date(),
                },
            },
        });
    },
    async updateResetToken(id, reset_token, reset_token_expires) {
        return prisma_1.default.user.update({
            where: { id },
            data: { reset_token, reset_token_expires },
        });
    },
};
//# sourceMappingURL=user.repository.js.map