const { verifyToken } = require('../utils/jwt');
const { AUTH_COOKIE_NAME } = require('../utils/cookie');
const { createAppError } = require('../utils/appError');

const authenticate = (req, res, next) => {
  const token = req.cookies[AUTH_COOKIE_NAME];
  if (!token) return next(createAppError('Unauthorized', 401));
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(createAppError('Unauthorized', 401));
  }
};

module.exports = { authenticate };
