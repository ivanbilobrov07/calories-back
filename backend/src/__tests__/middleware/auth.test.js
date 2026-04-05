jest.mock('../../utils/jwt');
jest.mock('../../utils/cookie', () => ({ AUTH_COOKIE_NAME: 'token' }));

process.env.JWT_SECRET = 'test-secret';

const { verifyToken } = require('../../utils/jwt');
const { authenticate } = require('../../middleware/auth');

describe('authenticate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('calls next with 401 AppError when no token in cookies', () => {
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
  });

  test('sets req.user.id from valid token payload', () => {
    req.cookies.token = 'valid.jwt.token';
    verifyToken.mockReturnValue({ sub: 'user-123' });
    authenticate(req, res, next);
    expect(req.user).toEqual({ id: 'user-123' });
  });

  test('calls next with no arguments on success', () => {
    req.cookies.token = 'valid.jwt.token';
    verifyToken.mockReturnValue({ sub: 'user-abc' });
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('calls next with 401 AppError when verifyToken throws', () => {
    req.cookies.token = 'bad.token';
    verifyToken.mockImplementation(() => { throw new Error('jwt malformed'); });
    authenticate(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  test('does not set req.user when token is invalid', () => {
    req.cookies.token = 'bad.token';
    verifyToken.mockImplementation(() => { throw new Error('invalid'); });
    authenticate(req, res, next);
    expect(req.user).toBeUndefined();
  });
});
