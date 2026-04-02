const authService = require('../services/authService');
const { AUTH_COOKIE_NAME, getCookieOptions } = require('../utils/cookie');

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const { token, user } = await authService.register({ email, password });
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const { token, user } = await authService.login({ email, password });
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ message: 'Logged out' });
};

module.exports = { register, login, logout };
