"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.emailService = {
    createTransporter() {
        return nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    },
    async sendPasswordResetEmail(to, token) {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("SMTP credentials not configured. Email not sent.");
            console.log(`Reset Token for ${to}: ${token}`);
            return;
        }
        const transporter = this.createTransporter();
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;
        const mailOptions = {
            from: `ProjectFlow <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject: "Password Reset Request",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">ProjectFlow</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6B7280; font-size: 14px;">${resetLink}</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">This link will expire in 1 hour.</p>
        </div>
      `,
        };
        try {
            await transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw new Error("Failed to send reset email.");
        }
    },
};
//# sourceMappingURL=email.service.js.map