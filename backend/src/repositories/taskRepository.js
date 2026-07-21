const prisma = require('../config/db');

class TaskRepository {
  async create(data) {
    return prisma.task.create({
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        parentTask: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findById(id, workspaceId) {
    return prisma.task.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        parentTask: {
          select: { id: true, title: true },
        },
        childTasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async findAll({ workspaceId, status, assigneeId, sort, page = 1, limit = 10, search }) {
    const skip = (page - 1) * limit;
    const where = { workspaceId };

    if (status) {
      where.status = status;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Set sorting
    let orderBy = { createdAt: 'desc' }; // default
    if (sort === 'dueDate') {
      orderBy = { dueDate: 'asc' };
    } else if (sort === 'createdAt') {
      orderBy = { createdAt: 'desc' };
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          parentTask: {
            select: { id: true, title: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async update(id, workspaceId, data) {
    return prisma.task.update({
      where: {
        id,
        workspaceId,
      },
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        parentTask: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async delete(id, workspaceId) {
    return prisma.task.delete({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async hasOpenSubtasks(taskId, workspaceId) {
    const openSubtask = await prisma.task.findFirst({
      where: {
        parentTaskId: taskId,
        workspaceId,
        status: {
          not: 'DONE',
        },
      },
    });
    return openSubtask !== null;
  }

  async getStats(workspaceId) {
    const groups = await prisma.task.groupBy({
      by: ['status'],
      where: { workspaceId },
      _count: {
        id: true,
      },
    });

    const stats = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      total: 0,
    };

    groups.forEach((group) => {
      stats[group.status] = group._count.id;
      stats.total += group._count.id;
    });

    return stats;
  }
}

module.exports = new TaskRepository();
