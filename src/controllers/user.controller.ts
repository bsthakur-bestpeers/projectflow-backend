import { Request, Response, NextFunction } from "express";
import argon2 from "argon2";
import { userRepository } from "../repositories/user.repository";

export const userController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userRepository.findAllActive();
      res.json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const { full_name, password } = req.body;
      const updateData: { full_name?: string; password_hash?: string } = {};

      if (full_name) {
        updateData.full_name = full_name;
      }
      if (password) {
        updateData.password_hash = await argon2.hash(password);
      }

      const updatedUser = await userRepository.updateProfile(userId, updateData);

      res.json({
        success: true,
        data: updatedUser,
        message: "Profile updated successfully.",
      });
    } catch (err) {
      next(err);
    }
  },
};
