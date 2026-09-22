import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { userRepository } from "../repositories/user.repository";
import { createError } from "../middleware/error.middleware";
import { emailService } from "./email.service";

export const authService = {
  // ... existing register, login, getMe ...
  
  async register(full_name: string, email: string, password: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw createError("An account with this email already exists.", 409);
    }
    const password_hash = await argon2.hash(password);
    
    // Check if this is the first user registered in the system
    const count = await userRepository.countTotal();
    const isFirstUser = count === 0;

    const user = await userRepository.create({
      full_name,
      email,
      password_hash,
      role: isFirstUser ? "ADMIN" : "USER",
      approval_status: isFirstUser ? "APPROVED" : "PENDING",
      is_active: isFirstUser,
    });
    return user;
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw createError("Invalid email or password.", 401);
    }

    const valid = await argon2.verify(user.password_hash, password);
    if (!valid) {
      throw createError("Invalid email or password.", 401);
    }

    if (user.approval_status === "PENDING") {
      throw createError("Your account is pending admin approval. Please wait for an administrator to approve your registration.", 403);
    }

    if (user.approval_status === "REJECTED") {
      throw createError("Your account registration was not approved. Please contact an administrator.", 403);
    }

    if (!user.is_active) {
      throw createError("Your account is inactive. Please contact an administrator.", 403);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "7d" }
    );

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async getMe(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createError("User not found.", 404);
    }
    return user;
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Do not reveal whether user exists for security reasons
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.updateResetToken(user.id, resetToken, expires);

    // Send the email
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw createError("Invalid or expired reset token.", 400);
    }

    const password_hash = await argon2.hash(newPassword);
    
    // Update password and clear reset token
    await userRepository.updateProfile(user.id, { password_hash });
    await userRepository.updateResetToken(user.id, null, null);
  },
};
