const { AUTH_COOKIE_NAME, getCookieOptions } = require('../../utils/cookie');

describe('cookie utils', () => {
  describe('AUTH_COOKIE_NAME', () => {
    test('is "token"', () => {
      expect(AUTH_COOKIE_NAME).toBe('token');
    });
  });

  describe('getCookieOptions', () => {
    test('httpOnly is true', () => {
      const opts = getCookieOptions();
      expect(opts.httpOnly).toBe(true);
    });

    test('sameSite is lax', () => {
      const opts = getCookieOptions();
      expect(opts.sameSite).toBe('lax');
    });

    test('maxAge is 24 hours in milliseconds', () => {
      const opts = getCookieOptions();
      expect(opts.maxAge).toBe(24 * 60 * 60 * 1000);
    });

    test('secure is false in non-production', () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const opts = getCookieOptions();
      expect(opts.secure).toBe(false);
      process.env.NODE_ENV = oldEnv;
    });

    test('secure is true in production', () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const opts = getCookieOptions();
      expect(opts.secure).toBe(true);
      process.env.NODE_ENV = oldEnv;
    });
  });
});
