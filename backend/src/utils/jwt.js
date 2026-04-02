const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = '24h';

const signToken = (userId) => jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
  JWT_EXPIRES_IN,
  signToken,
  verifyToken
};
