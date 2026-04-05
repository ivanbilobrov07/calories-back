jest.mock('../../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const api = require('../../api/axios');
const { getProfile, updateProfile } = require('../../api/users');

describe('users API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    test('calls api.get on the correct endpoint', () => {
      api.get.mockResolvedValue({ data: {} });
      getProfile();
      expect(api.get).toHaveBeenCalledWith('/api/users/profile');
    });

    test('returns the profile response', async () => {
      const profile = { id: '1', email: 'a@b.com', name: 'Alice' };
      api.get.mockResolvedValue({ data: profile });
      const result = await getProfile();
      expect(result.data).toEqual(profile);
    });

    test('propagates errors from api', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));
      await expect(getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    test('calls api.put on the correct endpoint', () => {
      api.put.mockResolvedValue({ data: {} });
      updateProfile({ name: 'Bob' });
      expect(api.put).toHaveBeenCalledWith('/api/users/profile', { name: 'Bob' });
    });

    test('passes data payload to api.put', () => {
      api.put.mockResolvedValue({ data: {} });
      const payload = { name: 'Eve', age: 28, activityLevel: 'active' };
      updateProfile(payload);
      expect(api.put).toHaveBeenCalledWith('/api/users/profile', payload);
    });

    test('returns the updated profile', async () => {
      const updated = { id: '1', name: 'Updated' };
      api.put.mockResolvedValue({ data: updated });
      const result = await updateProfile({ name: 'Updated' });
      expect(result.data).toEqual(updated);
    });
  });
});
