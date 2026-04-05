jest.mock('../../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const api = require('../../api/axios');
const { getLogs, createLog, updateLog, deleteLog, getPaginatedLogs } = require('../../api/logs');

describe('logs API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getLogs', () => {
    test('calls api.get with correct endpoint and date param', () => {
      api.get.mockResolvedValue({ data: [] });
      getLogs('2024-01-01');
      expect(api.get).toHaveBeenCalledWith('/api/logs', { params: { date: '2024-01-01' } });
    });

    test('returns the logs array', async () => {
      api.get.mockResolvedValue({ data: [{ id: '1' }] });
      const result = await getLogs('2024-01-01');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('createLog', () => {
    test('calls api.post with correct endpoint and data', () => {
      api.post.mockResolvedValue({ data: {} });
      const data = { mealType: 'breakfast', logDate: '2024-01-01', items: [] };
      createLog(data);
      expect(api.post).toHaveBeenCalledWith('/api/logs', data);
    });

    test('returns the created log', async () => {
      const log = { id: 'l1', mealType: 'breakfast' };
      api.post.mockResolvedValue({ data: log });
      const result = await createLog({ mealType: 'breakfast', items: [] });
      expect(result.data).toEqual(log);
    });
  });

  describe('updateLog', () => {
    test('calls api.put with correct URL and data', () => {
      api.put.mockResolvedValue({ data: {} });
      const data = { mealType: 'lunch' };
      updateLog('log-1', data);
      expect(api.put).toHaveBeenCalledWith('/api/logs/log-1', data);
    });

    test('uses the provided log id in the URL', () => {
      api.put.mockResolvedValue({ data: {} });
      updateLog('xyz-123', { mealType: 'dinner' });
      expect(api.put.mock.calls[0][0]).toBe('/api/logs/xyz-123');
    });
  });

  describe('deleteLog', () => {
    test('calls api.delete with correct URL', () => {
      api.delete.mockResolvedValue({});
      deleteLog('log-99');
      expect(api.delete).toHaveBeenCalledWith('/api/logs/log-99');
    });

    test('uses the provided log id in the URL', () => {
      api.delete.mockResolvedValue({});
      deleteLog('abc-456');
      expect(api.delete.mock.calls[0][0]).toBe('/api/logs/abc-456');
    });
  });

  describe('getPaginatedLogs', () => {
    test('calls api.get with correct endpoint and page param', () => {
      api.get.mockResolvedValue({ data: {} });
      getPaginatedLogs(2);
      expect(api.get).toHaveBeenCalledWith('/api/logs/paginated', { params: { page: 2 } });
    });

    test('returns the paginated response', async () => {
      const response = { data: { items: [], total: 0, hasMore: false } };
      api.get.mockResolvedValue(response);
      const result = await getPaginatedLogs(1);
      expect(result.data.hasMore).toBe(false);
    });
  });
});
