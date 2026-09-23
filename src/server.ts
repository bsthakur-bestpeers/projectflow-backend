import app from "./app";
import prisma from "./db/prisma";

const PORT = parseInt(process.env.PORT || "4000", 10);

async function main() {
  // Verify database connection
  await prisma.$connect();
  console.log("Database connected successfully.");

  // Auto-migrate schema changes in production environments (e.g. Render)
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'MEDIUM';
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "tickets_priority_idx" ON "tickets"("priority");
    `);
    console.log("Database schema verified: tickets.priority column ensured.");
  } catch (migErr) {
    console.warn("Schema verification notice:", migErr);
  }

  app.listen(PORT, () => {
    console.log(`ProjectFlow API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
}

main().catch(async (error) => {
  console.error("Failed to start server:", error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
