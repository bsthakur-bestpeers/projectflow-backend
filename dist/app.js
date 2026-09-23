"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const sprint_routes_1 = __importDefault(require("./routes/sprint.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app_constants_1 = require("./constants/app.constants");
const app = (0, express_1.default)();
// Trust proxy for rate limiters on Render
app.set("trust proxy", 1);
// Security headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// CORS
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ""))
        : [],
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Serve static uploads with cross-origin headers
app.use("/uploads", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
}, express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// Health check with version info
app.get("/health", (_, res) => {
    res.json({
        success: true,
        name: app_constants_1.APP_NAME,
        version: app_constants_1.APP_VERSION,
        message: `${app_constants_1.APP_NAME} API ${app_constants_1.APP_VERSION} is running.`,
        timestamp: new Date().toISOString(),
    });
});
// V1 API Router
const v1Router = express_1.default.Router();
v1Router.use("/auth", auth_routes_1.default);
v1Router.use("/users", user_routes_1.default);
v1Router.use("/projects", project_routes_1.default);
v1Router.use("/sprints", sprint_routes_1.default);
v1Router.use("/tickets", ticket_routes_1.default);
v1Router.use("/search", search_routes_1.default);
v1Router.use("/admin", admin_routes_1.default);
v1Router.use("/uploads", upload_routes_1.default);
// Mount versioned v1 routes
app.use("/api/v1", v1Router);
// 404 handler
app.use(error_middleware_1.notFoundHandler);
// Global error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map