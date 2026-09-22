export declare const emailService: {
    createTransporter(): import("nodemailer").Mail<import("nodemailer").SMTPSentMessageInfo>;
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
};
//# sourceMappingURL=email.service.d.ts.map