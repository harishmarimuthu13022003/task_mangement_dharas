const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');
const {
  createTaskValidator,
  updateTaskValidator,
  getTasksQueryValidator,
  taskIdParamValidator,
} = require('../validators/taskValidator');

const router = express.Router();

// Protect all task endpoints with JWT auth middleware
router.use(authMiddleware);

router.post('/', createTaskValidator, taskController.createTask);
router.get('/', getTasksQueryValidator, taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/:id', taskIdParamValidator, taskController.getTaskById);
router.put('/:id', updateTaskValidator, taskController.updateTask);
router.delete('/:id', taskIdParamValidator, taskController.deleteTask);

module.exports = router;
