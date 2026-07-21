const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Attach user profile summary to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      workspaceId: decoded.workspaceId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid authorization token.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Authorization token has expired.'));
    } else {
      next(error);
    }
  }
};

module.exports = authMiddleware;
