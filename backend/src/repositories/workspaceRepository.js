const prisma = require('../config/db');

class WorkspaceRepository {
  async create(data, tx = prisma) {
    return tx.workspace.create({
      data,
    });
  }

  async findById(id) {
    return prisma.workspace.findUnique({
      where: { id },
    });
  }
}

module.exports = new WorkspaceRepository();
