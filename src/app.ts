import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import sprintRoutes from "./routes/sprint.routes";
import ticketRoutes from "./routes/ticket.routes";
import userRoutes from "./routes/user.routes";
import searchRoutes from "./routes/search.routes";
import adminRoutes from "./routes/admin.routes";
import uploadRoutes from "./routes/upload.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

import { APP_NAME, APP_VERSION } from "./constants/app.constants";

const app = express();

// Trust proxy for rate limiters on Render
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ""))
    : [],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploads
app.use("/uploads", express.static("uploads"));

// Health check with version info
app.get("/health", (_, res) => {
  res.json({
    success: true,
    name: APP_NAME,
    version: APP_VERSION,
    message: `${APP_NAME} API ${APP_VERSION} is running.`,
    timestamp: new Date().toISOString(),
  });
});

// V1 API Router
const v1Router = express.Router();
v1Router.use("/auth", authRoutes);
v1Router.use("/users", userRoutes);
v1Router.use("/projects", projectRoutes);
v1Router.use("/sprints", sprintRoutes);
v1Router.use("/tickets", ticketRoutes);
v1Router.use("/search", searchRoutes);
v1Router.use("/admin", adminRoutes);
v1Router.use("/uploads", uploadRoutes);

// Mount versioned v1 routes
app.use("/api/v1", v1Router);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
