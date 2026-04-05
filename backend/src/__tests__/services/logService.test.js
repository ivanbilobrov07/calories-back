jest.mock('../../prisma/client');

const { prisma } = require('../../prisma/client');
const { getLogsForDate, getPaginatedLogs, createLog, updateLog, deleteLog } = require('../../services/logService');

const mockFood = {
  id: 'food-1',
  name: 'Apple',
  kcalPer100g: 52,
  proteinPer100g: 0.3,
  fatPer100g: 0.2,
  carbsPer100g: 13.8,
  source: 'custom',
};

const mockLog = {
  id: 'log-1',
  userId: 'user-1',
  totalKcal: 52,
  totalProtein: 0.3,
  totalFat: 0.2,
  totalCarbs: 13.8,
  mealType: 'breakfast',
  logDate: new Date('2024-01-01T00:00:00.000Z'),
  items: [{ food: mockFood, quantityG: 100 }],
};

describe('logService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getLogsForDate', () => {
    test('queries by userId and parsed date', async () => {
      prisma.mealLog.findMany.mockResolvedValue([mockLog]);
      const result = await getLogsForDate('user-1', '2024-01-01');
      expect(prisma.mealLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId: 'user-1' }) }),
      );
      expect(result).toEqual([mockLog]);
    });

    test('returns empty array when no logs exist', async () => {
      prisma.mealLog.findMany.mockResolvedValue([]);
      const result = await getLogsForDate('user-1', '2024-01-02');
      expect(result).toEqual([]);
    });
  });

  describe('getPaginatedLogs', () => {
    test('calculates correct skip for page 1', async () => {
      prisma.mealLog.findMany.mockResolvedValue([]);
      prisma.mealLog.count.mockResolvedValue(0);
      await getPaginatedLogs('user-1', 1, 20);
      expect(prisma.mealLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    test('calculates correct skip for page 3', async () => {
      prisma.mealLog.findMany.mockResolvedValue([]);
      prisma.mealLog.count.mockResolvedValue(100);
      await getPaginatedLogs('user-1', 3, 20);
      expect(prisma.mealLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40 }),
      );
    });

    test('hasMore is true when more items exist', async () => {
      prisma.mealLog.findMany.mockResolvedValue(new Array(20).fill(mockLog));
      prisma.mealLog.count.mockResolvedValue(50);
      const result = await getPaginatedLogs('user-1', 1, 20);
      expect(result.hasMore).toBe(true);
    });

    test('hasMore is false on the last page', async () => {
      prisma.mealLog.findMany.mockResolvedValue([mockLog]);
      prisma.mealLog.count.mockResolvedValue(1);
      const result = await getPaginatedLogs('user-1', 1, 20);
      expect(result.hasMore).toBe(false);
    });

    test('returns page number and total in result', async () => {
      prisma.mealLog.findMany.mockResolvedValue([]);
      prisma.mealLog.count.mockResolvedValue(5);
      const result = await getPaginatedLogs('user-1', 2, 20);
      expect(result.page).toBe(2);
      expect(result.total).toBe(5);
    });
  });

  describe('createLog', () => {
    test('throws 400 when items array is empty', async () => {
      await expect(
        createLog('user-1', { items: [], mealType: 'breakfast', logDate: '2024-01-01' }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test('throws 400 when mealType is missing', async () => {
      await expect(
        createLog('user-1', { items: [{ foodId: 'f1', quantityG: 100 }], mealType: '', logDate: '2024-01-01' }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test('throws 400 when logDate is missing', async () => {
      await expect(
        createLog('user-1', { items: [{ foodId: 'f1', quantityG: 100 }], mealType: 'breakfast', logDate: '' }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test('throws 404 when foodId not found in database', async () => {
      prisma.food.findUnique.mockResolvedValue(null);
      await expect(
        createLog('user-1', { items: [{ foodId: 'bad-id', quantityG: 100 }], mealType: 'lunch', logDate: '2024-01-01' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test('creates log with correctly calculated macro totals', async () => {
      prisma.food.findUnique.mockResolvedValue(mockFood);
      prisma.mealLog.create.mockResolvedValue(mockLog);

      await createLog('user-1', {
        items: [{ foodId: 'food-1', quantityG: 100 }],
        mealType: 'breakfast',
        logDate: '2024-01-01',
      });

      expect(prisma.mealLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalKcal: 52,
            totalProtein: 0.3,
            totalFat: 0.2,
            totalCarbs: 13.8,
          }),
        }),
      );
    });

    test('creates externalFood if not found in database', async () => {
      const externalFood = { name: 'USDA Apple', kcalPer100g: 50, proteinPer100g: 0.2, fatPer100g: 0.1, carbsPer100g: 13 };
      prisma.food.findFirst.mockResolvedValue(null);
      prisma.food.create.mockResolvedValue({ id: 'new-f', ...externalFood, source: 'openfoodfacts' });
      prisma.mealLog.create.mockResolvedValue(mockLog);

      await createLog('user-1', {
        items: [{ externalFood, quantityG: 100 }],
        mealType: 'breakfast',
        logDate: '2024-01-01',
      });

      expect(prisma.food.create).toHaveBeenCalled();
    });
  });

  describe('updateLog', () => {
    test('throws 404 when log not found', async () => {
      prisma.mealLog.findUnique.mockResolvedValue(null);
      await expect(updateLog('user-1', 'bad-log', {})).rejects.toMatchObject({ statusCode: 404 });
    });

    test('throws 403 when user does not own the log', async () => {
      prisma.mealLog.findUnique.mockResolvedValue({ id: 'log-1', userId: 'other-user' });
      await expect(updateLog('user-1', 'log-1', {})).rejects.toMatchObject({ statusCode: 403 });
    });

    test('updates only mealType when no items provided', async () => {
      prisma.mealLog.findUnique.mockResolvedValue({ id: 'log-1', userId: 'user-1' });
      prisma.mealLog.update.mockResolvedValue({ ...mockLog, mealType: 'dinner' });

      await updateLog('user-1', 'log-1', { mealType: 'dinner' });
      expect(prisma.mealLog.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ mealType: 'dinner' }) }),
      );
    });

    test('deletes old items and creates new ones when items are provided', async () => {
      prisma.mealLog.findUnique.mockResolvedValue({ id: 'log-1', userId: 'user-1' });
      prisma.food.findUnique.mockResolvedValue(mockFood);
      prisma.mealLogItem.deleteMany.mockResolvedValue({});
      prisma.mealLog.update.mockResolvedValue(mockLog);

      await updateLog('user-1', 'log-1', {
        items: [{ foodId: 'food-1', quantityG: 150 }],
        mealType: 'lunch',
      });

      expect(prisma.mealLogItem.deleteMany).toHaveBeenCalledWith({ where: { mealLogId: 'log-1' } });
    });
  });

  describe('deleteLog', () => {
    test('throws 404 when log not found', async () => {
      prisma.mealLog.findUnique.mockResolvedValue(null);
      await expect(deleteLog('user-1', 'bad-log')).rejects.toMatchObject({ statusCode: 404 });
    });

    test('throws 403 when user does not own the log', async () => {
      prisma.mealLog.findUnique.mockResolvedValue({ id: 'log-1', userId: 'other-user' });
      await expect(deleteLog('user-1', 'log-1')).rejects.toMatchObject({ statusCode: 403 });
    });

    test('deletes the log when ownership is confirmed', async () => {
      prisma.mealLog.findUnique.mockResolvedValue({ id: 'log-1', userId: 'user-1' });
      prisma.mealLog.delete.mockResolvedValue({});

      await deleteLog('user-1', 'log-1');
      expect(prisma.mealLog.delete).toHaveBeenCalledWith({ where: { id: 'log-1' } });
    });

    test('does not call delete when user is not owner', async () => {
      prisma.mealLog.findUnique.mockResolvedValue({ id: 'log-1', userId: 'other-user' });
      await deleteLog('user-1', 'log-1').catch(() => {});
      expect(prisma.mealLog.delete).not.toHaveBeenCalled();
    });
  });
});
