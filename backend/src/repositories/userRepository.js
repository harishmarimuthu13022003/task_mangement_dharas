const prisma = require('../config/db');

class UserRepository {
  async create(data, tx = prisma) {
    return tx.user.create({
      data,
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        workspace: true,
      },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        workspaceId: true,
        createdAt: true,
      },
    });
  }

  async findAllByWorkspace(workspaceId) {
    return prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

module.exports = new UserRepository();
