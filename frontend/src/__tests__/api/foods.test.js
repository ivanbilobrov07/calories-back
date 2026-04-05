jest.mock('../../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const api = require('../../api/axios');
const { searchFoods, createCustomFood } = require('../../api/foods');

describe('foods API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('searchFoods', () => {
    test('calls api.get with correct endpoint and query param', () => {
      api.get.mockResolvedValue({ data: {} });
      searchFoods('apple');
      expect(api.get).toHaveBeenCalledWith('/api/foods/search', { params: { q: 'apple' } });
    });

    test('passes the query string as q param', () => {
      api.get.mockResolvedValue({ data: {} });
      searchFoods('banana split');
      expect(api.get.mock.calls[0][1]).toEqual({ params: { q: 'banana split' } });
    });

    test('returns the search results', async () => {
      const response = { data: { internal: [], external: [{ name: 'Apple' }] } };
      api.get.mockResolvedValue(response);
      const result = await searchFoods('apple');
      expect(result.data.external[0].name).toBe('Apple');
    });

    test('propagates errors from api', async () => {
      api.get.mockRejectedValue(new Error('Server error'));
      await expect(searchFoods('foo')).rejects.toThrow('Server error');
    });
  });

  describe('createCustomFood', () => {
    test('calls api.post with correct endpoint and data', () => {
      api.post.mockResolvedValue({ data: {} });
      const food = { name: 'Oats', kcalPer100g: 389 };
      createCustomFood(food);
      expect(api.post).toHaveBeenCalledWith('/api/foods/custom', food);
    });

    test('returns the created food', async () => {
      const created = { id: 'f1', name: 'Oats', kcalPer100g: 389 };
      api.post.mockResolvedValue({ data: created });
      const result = await createCustomFood({ name: 'Oats', kcalPer100g: 389 });
      expect(result.data).toEqual(created);
    });

    test('propagates 400 validation errors', async () => {
      const err = Object.assign(new Error('Bad Request'), { response: { status: 400 } });
      api.post.mockRejectedValue(err);
      await expect(createCustomFood({})).rejects.toMatchObject({ response: { status: 400 } });
    });
  });
});
