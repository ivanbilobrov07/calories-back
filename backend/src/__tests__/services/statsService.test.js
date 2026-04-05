jest.mock('../../prisma/client');

const { prisma } = require('../../prisma/client');
const { getWeeklyStats } = require('../../services/statsService');

describe('statsService.getWeeklyStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-07T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns exactly 7 entries', async () => {
    prisma.mealLog.findMany.mockResolvedValue([]);
    const result = await getWeeklyStats('user-1');
    expect(result).toHaveLength(7);
  });

  test('last entry date matches today', async () => {
    prisma.mealLog.findMany.mockResolvedValue([]);
    const result = await getWeeklyStats('user-1');
    expect(result[6].date).toBe('2024-01-07');
  });

  test('first entry date is 6 days ago', async () => {
    prisma.mealLog.findMany.mockResolvedValue([]);
    const result = await getWeeklyStats('user-1');
    expect(result[0].date).toBe('2024-01-01');
  });

  test('each entry has date and totalKcal fields', async () => {
    prisma.mealLog.findMany.mockResolvedValue([]);
    const result = await getWeeklyStats('user-1');
    result.forEach((entry) => {
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('totalKcal');
    });
  });

  test('sums totalKcal correctly for multiple logs on the same day', async () => {
    prisma.mealLog.findMany.mockResolvedValue([
      { logDate: new Date('2024-01-07T00:00:00.000Z'), totalKcal: 500 },
      { logDate: new Date('2024-01-07T00:00:00.000Z'), totalKcal: 300 },
    ]);
    const result = await getWeeklyStats('user-1');
    const today = result.find((r) => r.date === '2024-01-07');
    expect(today.totalKcal).toBe(800);
  });

  test('returns 0 for days with no logs', async () => {
    prisma.mealLog.findMany.mockResolvedValue([
      { logDate: new Date('2024-01-07T00:00:00.000Z'), totalKcal: 200 },
    ]);
    const result = await getWeeklyStats('user-1');
    const dayWithNoLogs = result.find((r) => r.date === '2024-01-03');
    expect(dayWithNoLogs.totalKcal).toBe(0);
  });

  test('queries database with correct userId', async () => {
    prisma.mealLog.findMany.mockResolvedValue([]);
    await getWeeklyStats('target-user');
    expect(prisma.mealLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'target-user' }) }),
    );
  });
});
