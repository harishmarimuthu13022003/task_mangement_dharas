const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array().map((err) => ({
          field: err.path || err.param,
          message: err.msg,
        })),
      },
    });
  }
  next();
};

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status must be one of: TODO, IN_PROGRESS, DONE.'),
  body('assigneeId')
    .notEmpty()
    .withMessage('Assignee ID is required.')
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer.'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date string.'),
  body('parentTaskId')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Parent task ID must be a positive integer.'),
  validate,
];

const updateTaskValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID in URL must be a positive integer.'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty.'),
  body('description')
    .optional({ nullable: true }),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status must be one of: TODO, IN_PROGRESS, DONE.'),
  body('assigneeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer.'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date string.'),
  body('parentTaskId')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Parent task ID must be a positive integer.'),
  validate,
];

const getTasksQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page query param must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit query param must be a positive integer between 1 and 100.'),
  query('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status query filter must be one of: TODO, IN_PROGRESS, DONE.'),
  query('assignee')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee query filter must be a positive integer.'),
  query('sort')
    .optional()
    .isIn(['dueDate', 'createdAt'])
    .withMessage('Sort option must be one of: dueDate, createdAt.'),
  validate,
];

const taskIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer.'),
  validate,
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  getTasksQueryValidator,
  taskIdParamValidator,
};
