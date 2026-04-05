jest.mock('axios');
jest.mock('../../prisma/client');

const axios = require('axios');
const { prisma } = require('../../prisma/client');
const { searchFoods, createCustomFood } = require('../../services/foodService');

const mockInternalFood = {
  id: 'food-1',
  name: 'Apple',
  kcalPer100g: 52,
  source: 'custom',
};

const usdaResponse = {
  data: {
    foods: [
      {
        description: 'Raw Apple',
        foodNutrients: [
          { nutrientName: 'Energy', value: 52 },
          { nutrientName: 'Protein', value: 0.3 },
          { nutrientName: 'Total lipid (fat)', value: 0.2 },
          { nutrientName: 'Carbohydrate, by difference', value: 13.8 },
        ],
      },
    ],
  },
};

describe('foodService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('searchFoods', () => {
    test('returns internal foods from database', async () => {
      prisma.food.findMany.mockResolvedValue([mockInternalFood]);
      axios.get.mockResolvedValue(usdaResponse);

      const result = await searchFoods('apple', 'user-1');
      expect(result.internal).toEqual([mockInternalFood]);
    });

    test('returns external foods from USDA API', async () => {
      prisma.food.findMany.mockResolvedValue([]);
      axios.get.mockResolvedValue(usdaResponse);

      const result = await searchFoods('apple', 'user-1');
      expect(result.external).toHaveLength(1);
      expect(result.external[0].name).toBe('Raw Apple');
      expect(result.external[0].kcalPer100g).toBe(52);
    });

    test('returns empty external when USDA API fails', async () => {
      prisma.food.findMany.mockResolvedValue([mockInternalFood]);
      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await searchFoods('apple', 'user-1');
      expect(result.external).toEqual([]);
      expect(result.internal).toEqual([mockInternalFood]);
    });

    test('maps USDA nutrient fields correctly', async () => {
      prisma.food.findMany.mockResolvedValue([]);
      axios.get.mockResolvedValue(usdaResponse);

      const result = await searchFoods('apple', 'user-1');
      expect(result.external[0]).toMatchObject({
        name: 'Raw Apple',
        kcalPer100g: 52,
        proteinPer100g: 0.3,
        fatPer100g: 0.2,
        carbsPer100g: 13.8,
      });
    });

    test('defaults missing USDA nutrients to 0', async () => {
      prisma.food.findMany.mockResolvedValue([]);
      const partialResponse = {
        data: {
          foods: [{ description: 'Mystery Food', foodNutrients: [] }],
        },
      };
      axios.get.mockResolvedValue(partialResponse);

      const result = await searchFoods('mystery', 'user-1');
      expect(result.external[0].kcalPer100g).toBe(0);
    });
  });

  describe('createCustomFood', () => {
    test('throws 400 when name is missing', async () => {
      await expect(createCustomFood({ kcalPer100g: 100 }, 'user-1'))
        .rejects.toMatchObject({ statusCode: 400 });
    });

    test('throws 400 when kcalPer100g is null', async () => {
      await expect(createCustomFood({ name: 'Test', kcalPer100g: null }, 'user-1'))
        .rejects.toMatchObject({ statusCode: 400 });
    });

    test('creates food with correct data in database', async () => {
      const food = { name: 'Banana', kcalPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 23 };
      prisma.food.create.mockResolvedValue({ id: 'f1', ...food, source: 'custom' });

      await createCustomFood(food, 'user-1');
      expect(prisma.food.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          name: 'Banana',
          kcalPer100g: 89,
          source: 'custom',
          createdByUserId: 'user-1',
        }),
      }));
    });

    test('defaults optional macros to 0 when not provided', async () => {
      prisma.food.create.mockResolvedValue({ id: 'f1', name: 'Sugar', kcalPer100g: 387, source: 'custom' });

      await createCustomFood({ name: 'Sugar', kcalPer100g: 387 }, 'user-1');
      expect(prisma.food.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0 }),
      }));
    });

    test('returns the created food object', async () => {
      const created = { id: 'f1', name: 'Rice', kcalPer100g: 130, source: 'custom' };
      prisma.food.create.mockResolvedValue(created);

      const result = await createCustomFood({ name: 'Rice', kcalPer100g: 130 }, 'user-1');
      expect(result).toEqual(created);
    });
  });
});
