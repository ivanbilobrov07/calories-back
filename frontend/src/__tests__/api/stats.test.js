jest.mock('../../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const api = require('../../api/axios');
const { getWeeklyStats } = require('../../api/stats');

describe('stats API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls api.get on the correct endpoint', () => {
    api.get.mockResolvedValue({ data: [] });
    getWeeklyStats();
    expect(api.get).toHaveBeenCalledWith('/api/stats/weekly');
  });

  test('does not pass any params', () => {
    api.get.mockResolvedValue({ data: [] });
    getWeeklyStats();
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get.mock.calls[0]).toHaveLength(1);
  });

  test('returns the weekly stats array', async () => {
    const stats = [{ date: '2024-01-01', totalKcal: 2000 }];
    api.get.mockResolvedValue({ data: stats });
    const result = await getWeeklyStats();
    expect(result.data).toEqual(stats);
  });

  test('propagates errors from api', async () => {
    api.get.mockRejectedValue(new Error('Server error'));
    await expect(getWeeklyStats()).rejects.toThrow('Server error');
  });
});
