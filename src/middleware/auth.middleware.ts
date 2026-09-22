import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createError } from "./error.middleware";
import { JWT_COOKIE_NAME } from "../constants/app.constants";

export interface JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Try cookie first, then Authorization header
    const token =
      req.cookies?.[JWT_COOKIE_NAME] ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw createError("Authentication required. Please log in.", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError("Invalid or expired token. Please log in again.", 401));
    } else {
      next(error);
    }
  }
};
