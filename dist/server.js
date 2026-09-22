"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./db/prisma"));
const PORT = parseInt(process.env.PORT || "4000", 10);
async function main() {
    // Verify database connection
    await prisma_1.default.$connect();
    console.log("Database connected successfully.");
    app_1.default.listen(PORT, () => {
        console.log(`ProjectFlow API running on http://localhost:${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`   Health: http://localhost:${PORT}/health`);
    });
}
main().catch(async (error) => {
    console.error("Failed to start server:", error);
    await prisma_1.default.$disconnect();
    process.exit(1);
});
process.on("SIGINT", async () => {
    await prisma_1.default.$disconnect();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    await prisma_1.default.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=server.js.map