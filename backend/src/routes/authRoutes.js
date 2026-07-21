const express = require('express');
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.get('/users', authMiddleware, authController.getWorkspaceUsers);

module.exports = router;
