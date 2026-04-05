jest.mock('../../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const api = require('../../api/axios');
const { register, login, logout } = require('../../api/auth');

describe('auth API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    test('calls api.post with correct endpoint and payload', () => {
      api.post.mockResolvedValue({ data: {} });
      register('test@test.com', 'password123');
      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'test@test.com',
        password: 'password123',
      });
    });

    test('returns the api response', async () => {
      const mockResponse = { data: { user: { id: '1' }, token: 'tok' } };
      api.post.mockResolvedValue(mockResponse);
      const result = await register('a@b.com', 'pw');
      expect(result).toEqual(mockResponse);
    });

    test('propagates errors from api', async () => {
      api.post.mockRejectedValue(new Error('Network error'));
      await expect(register('a@b.com', 'pw')).rejects.toThrow('Network error');
    });
  });

  describe('login', () => {
    test('calls api.post with correct endpoint and payload', () => {
      api.post.mockResolvedValue({ data: {} });
      login('user@test.com', 'mypassword');
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'user@test.com',
        password: 'mypassword',
      });
    });

    test('returns the api response', async () => {
      const mockResponse = { data: { user: { id: '2' } } };
      api.post.mockResolvedValue(mockResponse);
      const result = await login('user@test.com', 'pw');
      expect(result).toEqual(mockResponse);
    });

    test('propagates 401 errors', async () => {
      const err = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
      api.post.mockRejectedValue(err);
      await expect(login('x@x.com', 'wrong')).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('logout', () => {
    test('calls api.post to logout endpoint', () => {
      api.post.mockResolvedValue({});
      logout();
      expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
    });

    test('does not pass any body to logout', () => {
      api.post.mockResolvedValue({});
      logout();
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post.mock.calls[0]).toHaveLength(1);
    });
  });
});
