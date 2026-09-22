import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ProjectFlow database...");

  // Hash a default password for all seed users
  const defaultPasswordHash = await argon2.hash("Password123");

  // Create users
  const alice = await prisma.user.upsert({
    where: { email: "alice@projectflow.dev" },
    update: {},
    create: {
      full_name: "Alice Johnson",
      email: "alice@projectflow.dev",
      password_hash: defaultPasswordHash,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@projectflow.dev" },
    update: {},
    create: {
      full_name: "Bob Smith",
      email: "bob@projectflow.dev",
      password_hash: defaultPasswordHash,
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@projectflow.dev" },
    update: {},
    create: {
      full_name: "Carol Williams",
      email: "carol@projectflow.dev",
      password_hash: defaultPasswordHash,
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: "dave@projectflow.dev" },
    update: {},
    create: {
      full_name: "Dave Chen",
      email: "dave@projectflow.dev",
      password_hash: defaultPasswordHash,
    },
  });

  console.log(`✅ Created ${4} seed users (password: Password123)`);

  // Create a sample project owned by Alice using a transaction
  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        name: "Phoenix Platform",
        description: "Core infrastructure modernization project — replacing legacy monolith with a clean, scalable architecture.",
        created_by: alice.id,
        status: "ACTIVE",
      },
    });

    // Add Alice as owner-member
    await tx.userProject.create({ data: { user_id: alice.id, project_id: p.id } });
    // Add other members
    await tx.userProject.createMany({
      data: [
        { user_id: bob.id, project_id: p.id },
        { user_id: carol.id, project_id: p.id },
        { user_id: dave.id, project_id: p.id },
      ],
    });
    return p;
  });

  console.log(`✅ Created project: ${project.name}`);

  // Create sprints
  const now = new Date();
  const sprintOneStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sprintOneEnd = new Date(now.getFullYear(), now.getMonth() - 1, 14);

  const completedSprint = await prisma.sprint.create({
    data: {
      project_id: project.id,
      name: "Sprint 1",
      start_date: sprintOneStart,
      end_date: sprintOneEnd,
      status: "COMPLETED",
    },
  });

  const activeSprint = await prisma.sprint.create({
    data: {
      project_id: project.id,
      name: "Sprint 2",
      start_date: new Date(now.getFullYear(), now.getMonth(), 1),
      end_date: new Date(now.getFullYear(), now.getMonth(), 14),
      status: "ACTIVE",
    },
  });

  const plannedSprint = await prisma.sprint.create({
    data: {
      project_id: project.id,
      name: "Sprint 3",
      start_date: new Date(now.getFullYear(), now.getMonth(), 15),
      end_date: new Date(now.getFullYear(), now.getMonth(), 28),
      status: "PLANNED",
    },
  });

  console.log(`✅ Created 3 sprints (1 completed, 1 active, 1 planned)`);

  // Create tickets
  const ticketData = [
    // Backlog tickets (sprint_id = null)
    { title: "Set up CI/CD pipeline", description: "<p>Configure GitHub Actions for automated testing and deployment.</p>", status: "TODO", estimation: "2d", sprint_id: null, author_id: alice.id, assignee_id: null, position: 1 },
    { title: "Design system tokens", description: "<p>Define color palette, typography, spacing scale for design system.</p>", status: "TODO", estimation: "1d", sprint_id: null, author_id: alice.id, assignee_id: bob.id, position: 2 },
    { title: "Write API documentation", description: "<p>Document all REST endpoints using OpenAPI specification.</p>", status: "TODO", estimation: "3d", sprint_id: null, author_id: bob.id, assignee_id: null, position: 3 },

    // Active sprint tickets
    { title: "Implement user authentication", description: "<p>JWT-based authentication with HTTP-only cookies and refresh tokens.</p>", status: "DONE", estimation: "2d", sprint_id: activeSprint.id, author_id: alice.id, assignee_id: alice.id, position: 1 },
    { title: "Create project CRUD endpoints", description: "<p>REST API for project create, read, update, delete operations.</p>", status: "IN_REVIEW", estimation: "1d", sprint_id: activeSprint.id, author_id: alice.id, assignee_id: bob.id, position: 1 },
    { title: "Build Kanban board UI", description: "<p>Drag-and-drop board with <strong>dnd-kit</strong> supporting status column moves and reordering.</p>", status: "IN_PROGRESS", estimation: "3d", sprint_id: activeSprint.id, author_id: bob.id, assignee_id: carol.id, position: 1 },
    { title: "Implement sprint management", description: "<p>Sprint CRUD with date validation and overlap detection.</p>", status: "TODO", estimation: "2d", sprint_id: activeSprint.id, author_id: alice.id, assignee_id: dave.id, position: 1 },
    { title: "Add ticket search and filtering", description: "<p>Backend query parameters for status, assignee, sprint, and text search.</p>", status: "TODO", estimation: "1d", sprint_id: activeSprint.id, author_id: carol.id, assignee_id: null, position: 2 },

    // Completed sprint tickets
    { title: "Initialize Next.js frontend", description: "<p>Bootstrap the Next.js 14 app with TypeScript, Tailwind, and Redux Toolkit.</p>", status: "DONE", estimation: "1d", sprint_id: completedSprint.id, author_id: alice.id, assignee_id: bob.id, position: 1 },
    { title: "Configure PostgreSQL with Prisma", description: "<p>Set up Prisma ORM with migrations and initial schema.</p>", status: "DONE", estimation: "1h", sprint_id: completedSprint.id, author_id: alice.id, assignee_id: alice.id, position: 2 },
  ];

  for (const t of ticketData) {
    await prisma.ticket.create({
      data: {
        project_id: project.id,
        sprint_id: t.sprint_id,
        title: t.title,
        description: t.description,
        status: t.status,
        estimation: t.estimation,
        author_id: t.author_id,
        assignee_id: t.assignee_id,
        position: t.position,
      },
    });
  }

  console.log(`✅ Created ${ticketData.length} sample tickets`);

  console.log("\n🎉 Seed complete!");
  console.log("   Login credentials (all users): password = Password123");
  console.log("   alice@projectflow.dev (Project Owner)");
  console.log("   bob@projectflow.dev (Member)");
  console.log("   carol@projectflow.dev (Member)");
  console.log("   dave@projectflow.dev (Member)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
