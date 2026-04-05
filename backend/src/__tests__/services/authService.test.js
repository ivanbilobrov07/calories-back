jest.mock('../../prisma/client');
jest.mock('bcrypt');
jest.mock('../../utils/jwt');

process.env.JWT_SECRET = 'test-secret';

const { prisma } = require('../../prisma/client');
const bcrypt = require('bcrypt');
const { signToken } = require('../../utils/jwt');
const { register, login } = require('../../services/authService');

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    test('throws 409 when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'exists@test.com' });
      await expect(register({ email: 'exists@test.com', password: 'pass' }))
        .rejects.toMatchObject({ statusCode: 409 });
    });

    test('hashes the password with 10 salt rounds', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_pw');
      prisma.user.create.mockResolvedValue({ id: 'new-id', email: 'new@test.com', name: null, dailyGoalKcal: null });
      signToken.mockReturnValue('tok');

      await register({ email: 'new@test.com', password: 'secret123' });
      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
    });

    test('creates user with hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_pw');
      prisma.user.create.mockResolvedValue({ id: '1', email: 'a@b.com', name: null, dailyGoalKcal: null });
      signToken.mockReturnValue('tok');

      await register({ email: 'a@b.com', password: 'pw' });
      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ email: 'a@b.com', passwordHash: 'hashed_pw' }),
      }));
    });

    test('returns token and user on success', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      const createdUser = { id: 'u1', email: 'new@test.com', name: 'Alice', dailyGoalKcal: 2000 };
      prisma.user.create.mockResolvedValue(createdUser);
      signToken.mockReturnValue('jwt-token');

      const result = await register({ email: 'new@test.com', password: 'pass' });
      expect(result.token).toBe('jwt-token');
      expect(result.user).toEqual(createdUser);
    });
  });

  describe('login', () => {
    test('throws 401 when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(login({ email: 'no@test.com', password: 'pass' }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    test('throws 401 when password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'x@x.com', passwordHash: 'hash' });
      bcrypt.compare.mockResolvedValue(false);
      await expect(login({ email: 'x@x.com', password: 'wrong' }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    test('returns token and user on success', async () => {
      const dbUser = { id: 'u1', email: 'x@x.com', passwordHash: 'hash', name: 'Bob', dailyGoalKcal: 2500 };
      prisma.user.findUnique.mockResolvedValue(dbUser);
      bcrypt.compare.mockResolvedValue(true);
      signToken.mockReturnValue('jwt-xyz');

      const result = await login({ email: 'x@x.com', password: 'correct' });
      expect(result.token).toBe('jwt-xyz');
      expect(result.user.email).toBe('x@x.com');
    });

    test('does not include passwordHash in returned user', async () => {
      const dbUser = { id: 'u1', email: 'x@x.com', passwordHash: 'hash', name: 'Bob', dailyGoalKcal: 2500 };
      prisma.user.findUnique.mockResolvedValue(dbUser);
      bcrypt.compare.mockResolvedValue(true);
      signToken.mockReturnValue('tok');

      const result = await login({ email: 'x@x.com', password: 'correct' });
      expect(result.user.passwordHash).toBeUndefined();
    });

    test('calls bcrypt.compare with correct password', async () => {
      const dbUser = { id: 'u1', email: 'x@x.com', passwordHash: 'stored-hash' };
      prisma.user.findUnique.mockResolvedValue(dbUser);
      bcrypt.compare.mockResolvedValue(true);
      signToken.mockReturnValue('tok');

      await login({ email: 'x@x.com', password: 'my-password' });
      expect(bcrypt.compare).toHaveBeenCalledWith('my-password', 'stored-hash');
    });
  });
});
