import { Request, Response, NextFunction } from "express";
import { createError } from "./error.middleware";
import { userRepository } from "../repositories/user.repository";

export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError("Authentication required.", 401);
    }

    // Check role in JWT or check DB directly for real-time validity
    if (req.user.role === "ADMIN") {
      return next();
    }

    const user = await userRepository.findById(req.user.userId);
    if (!user || user.role !== "ADMIN") {
      throw createError("Access denied. Admin role required.", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
