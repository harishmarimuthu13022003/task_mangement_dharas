const taskService = require('../services/taskService');

class TaskController {
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.workspaceId, req.body);
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req, res, next) {
    try {
      const result = await taskService.getTasks(req.user.workspaceId, req.query);
      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const taskId = parseInt(req.params.id, 10);
      const task = await taskService.getTaskById(taskId, req.user.workspaceId);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const taskId = parseInt(req.params.id, 10);
      const task = await taskService.updateTask(taskId, req.user.workspaceId, req.body);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const taskId = parseInt(req.params.id, 10);
      await taskService.deleteTask(taskId, req.user.workspaceId);
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskStats(req, res, next) {
    try {
      const stats = await taskService.getTaskStats(req.user.workspaceId);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
