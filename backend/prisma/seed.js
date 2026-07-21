const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database tables...');
  // Clear tables in reverse order of foreign key relationships
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workspace.deleteMany({});

  console.log('Seeding workspace...');
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Engineering Dev Workspace',
    },
  });

  console.log('Seeding users...');
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: passwordHash,
      workspaceId: workspace.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: passwordHash,
      workspaceId: workspace.id,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      password: passwordHash,
      workspaceId: workspace.id,
    },
  });

  console.log('Seeding tasks...');
  // Create Parent Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Database Connection',
      description: 'Initialize Prisma Client and connect to local PostgreSQL instance.',
      status: 'DONE',
      assigneeId: user1.id,
      workspaceId: workspace.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Build Authentication Module',
      description: 'Implement JWT sign, verify, and user registration pipelines.',
      status: 'IN_PROGRESS',
      assigneeId: user2.id,
      workspaceId: workspace.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Frontend Dashboard Development',
      description: 'Design interactive columns, pagination, and styling framework.',
      status: 'TODO',
      assigneeId: user3.id,
      workspaceId: workspace.id,
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // Overdue by 1 day
    },
  });

  // Create Child Tasks (Subtasks)
  console.log('Seeding subtasks...');
  await prisma.task.create({
    data: {
      title: 'Define JWT Middleware',
      description: 'Validate authorization headers and populate request contexts.',
      status: 'DONE',
      assigneeId: user2.id,
      workspaceId: workspace.id,
      parentTaskId: task2.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Hash User Passwords',
      description: 'Integrate bcrypt in the register endpoint.',
      status: 'DONE',
      assigneeId: user1.id,
      workspaceId: workspace.id,
      parentTaskId: task2.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Refresh Token Mechanism',
      description: 'Implement JWT refresh strategies for secure logins.',
      status: 'TODO',
      assigneeId: user2.id,
      workspaceId: workspace.id,
      parentTaskId: task2.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
