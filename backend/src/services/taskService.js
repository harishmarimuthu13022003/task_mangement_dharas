const taskRepository = require('../repositories/taskRepository');
const userRepository = require('../repositories/userRepository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class TaskService {
  async createTask(workspaceId, taskData) {
    const { title, description, status, assigneeId, dueDate, parentTaskId } = taskData;

    // 1. Verify assignee belongs to the same workspace
    const assignee = await userRepository.findById(assigneeId);
    if (!assignee || assignee.workspaceId !== workspaceId) {
      throw new BadRequestError('Assignee must belong to the same workspace.');
    }

    // 2. If parentTaskId is provided, verify it exists and belongs to the same workspace
    if (parentTaskId) {
      const parent = await taskRepository.findById(parentTaskId, workspaceId);
      if (!parent) {
        throw new BadRequestError('Parent task not found or belongs to another workspace.');
      }
    }

    return taskRepository.create({
      title,
      description,
      status: status || 'TODO',
      assigneeId,
      workspaceId,
      parentTaskId: parentTaskId ? parseInt(parentTaskId, 10) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  }

  async getTasks(workspaceId, filters) {
    const { page, limit, status, assignee, sort, search } = filters;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const assigneeId = assignee ? parseInt(assignee, 10) : undefined;

    const { tasks, total } = await taskRepository.findAll({
      workspaceId,
      status,
      assigneeId,
      sort,
      page: pageNum,
      limit: limitNum,
      search,
    });

    return {
      tasks,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    };
  }

  async getTaskById(id, workspaceId) {
    const task = await taskRepository.findById(id, workspaceId);
    if (!task) {
      throw new NotFoundError('Task not found.');
    }
    return task;
  }

  async updateTask(id, workspaceId, updateData) {
    // 1. Verify task exists in the workspace
    const existingTask = await taskRepository.findById(id, workspaceId);
    if (!existingTask) {
      throw new NotFoundError('Task not found.');
    }

    // 2. Validate Business Rule: Before updating status to DONE, check child tasks
    if (updateData.status === 'DONE' && existingTask.status !== 'DONE') {
      const hasOpen = await taskRepository.hasOpenSubtasks(id, workspaceId);
      if (hasOpen) {
        throw new BadRequestError('Cannot mark task as Done while subtasks are still open.');
      }
    }

    // 3. Verify assignee belongs to the same workspace if updated
    if (updateData.assigneeId && updateData.assigneeId !== existingTask.assigneeId) {
      const assignee = await userRepository.findById(updateData.assigneeId);
      if (!assignee || assignee.workspaceId !== workspaceId) {
        throw new BadRequestError('Assignee must belong to the same workspace.');
      }
    }

    // 4. Verify parent task if updated
    if (updateData.parentTaskId && updateData.parentTaskId !== existingTask.parentTaskId) {
      const parent = await taskRepository.findById(updateData.parentTaskId, workspaceId);
      if (!parent) {
        throw new BadRequestError('Parent task not found or belongs to another workspace.');
      }
    }

    // Construct clean update payload
    const data = {};
    if (updateData.title !== undefined) data.title = updateData.title;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.assigneeId !== undefined) data.assigneeId = parseInt(updateData.assigneeId, 10);
    if (updateData.dueDate !== undefined) data.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    if (updateData.parentTaskId !== undefined) {
      data.parentTaskId = updateData.parentTaskId ? parseInt(updateData.parentTaskId, 10) : null;
    }

    return taskRepository.update(id, workspaceId, data);
  }

  async deleteTask(id, workspaceId) {
    const existingTask = await taskRepository.findById(id, workspaceId);
    if (!existingTask) {
      throw new NotFoundError('Task not found.');
    }

    await taskRepository.delete(id, workspaceId);
    return { id };
  }

  async getTaskStats(workspaceId) {
    return taskRepository.getStats(workspaceId);
  }
}

module.exports = new TaskService();
