import { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/user.repository";
import { createError } from "../middleware/error.middleware";

export const adminController = {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const role = req.query.role as string | undefined;

      const users = await userRepository.findAllUsers({
        approval_status: status,
        role,
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async approveUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) throw createError("Invalid user ID.", 400);

      const user = await userRepository.findById(userId);
      if (!user) throw createError("User not found.", 404);

      const updated = await userRepository.updateApprovalStatus(userId, "APPROVED", true);

      res.json({
        success: true,
        data: updated,
        message: `User ${updated.full_name} has been approved successfully.`,
      });
    } catch (error) {
      next(error);
    }
  },

  async rejectUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) throw createError("Invalid user ID.", 400);

      const user = await userRepository.findById(userId);
      if (!user) throw createError("User not found.", 404);

      // Prevent rejecting self
      if (req.user?.userId === userId) {
        throw createError("You cannot reject your own account.", 400);
      }

      const updated = await userRepository.updateApprovalStatus(userId, "REJECTED", false);

      res.json({
        success: true,
        data: updated,
        message: `User ${updated.full_name} has been rejected.`,
      });
    } catch (error) {
      next(error);
    }
  },

  async changeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) throw createError("Invalid user ID.", 400);

      const { role } = req.body;
      if (!role || !["ADMIN", "USER"].includes(role)) {
        throw createError("Invalid role. Allowed values: ADMIN, USER.", 400);
      }

      if (req.user?.userId === userId && role !== "ADMIN") {
        throw createError("You cannot demote yourself from ADMIN.", 400);
      }

      const updated = await userRepository.updateRole(userId, role);

      res.json({
        success: true,
        data: updated,
        message: `Role for ${updated.full_name} updated to ${role}.`,
      });
    } catch (error) {
      next(error);
    }
  },
};
