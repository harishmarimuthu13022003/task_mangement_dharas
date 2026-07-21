const { body, validationResult } = require('express-validator');

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

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('workspaceName')
    .trim()
    .notEmpty()
    .withMessage('Workspace name is required.'),
  validate,
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
};
