jest.mock('../../prisma/client');

const { prisma } = require('../../prisma/client');
const { getProfile, updateProfile } = require('../../services/userService');

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  sex: 'male',
  age: 30,
  weightKg: 80,
  heightCm: 180,
  activityLevel: 'moderate',
  dailyGoalKcal: 2759,
  createdAt: new Date('2024-01-01'),
};

describe('userService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    test('throws 404 when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(getProfile('bad-id')).rejects.toMatchObject({ statusCode: 404 });
    });

    test('returns user data when found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await getProfile('user-1');
      expect(result.email).toBe('test@test.com');
    });

    test('queries by the provided userId', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      await getProfile('user-1');
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });
  });

  describe('updateProfile', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
    });

    test('throws 404 when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(updateProfile('bad-id', { name: 'New' })).rejects.toMatchObject({ statusCode: 404 });
    });

    test('updates name when provided', async () => {
      await updateProfile('user-1', { name: 'New Name' });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'New Name' }) }),
      );
    });

    test('converts age to Number', async () => {
      await updateProfile('user-1', { age: '35' });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ age: 35 }) }),
      );
    });

    test('uses provided dailyGoalKcal directly when given', async () => {
      await updateProfile('user-1', { dailyGoalKcal: 3000 });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ dailyGoalKcal: 3000 }) }),
      );
    });

    test('auto-calculates dailyGoalKcal when not provided', async () => {
      await updateProfile('user-1', { weightKg: 85 });
      const callArg = prisma.user.update.mock.calls[0][0];
      // Should have calculated and set dailyGoalKcal
      expect(callArg.data.dailyGoalKcal).toBeDefined();
      expect(typeof callArg.data.dailyGoalKcal).toBe('number');
    });

    test('returns updated user', async () => {
      const updated = { ...mockUser, name: 'Updated' };
      prisma.user.update.mockResolvedValue(updated);
      const result = await updateProfile('user-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });
});
