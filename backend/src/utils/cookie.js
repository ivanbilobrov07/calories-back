const AUTH_COOKIE_NAME = 'token';

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000
});

module.exports = {
  AUTH_COOKIE_NAME,
  getCookieOptions
};
