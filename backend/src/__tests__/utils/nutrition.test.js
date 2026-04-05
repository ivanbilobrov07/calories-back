const { calculateMacroTotals } = require('../../utils/nutrition');

const food = {
  kcalPer100g: 100,
  proteinPer100g: 10,
  fatPer100g: 5,
  carbsPer100g: 20,
};

describe('calculateMacroTotals', () => {
  test('returns full values for 100g', () => {
    const result = calculateMacroTotals(food, 100);
    expect(result).toEqual({
      totalKcal: 100,
      totalProtein: 10,
      totalFat: 5,
      totalCarbs: 20,
    });
  });

  test('returns halved values for 50g', () => {
    const result = calculateMacroTotals(food, 50);
    expect(result).toEqual({
      totalKcal: 50,
      totalProtein: 5,
      totalFat: 2.5,
      totalCarbs: 10,
    });
  });

  test('returns doubled values for 200g', () => {
    const result = calculateMacroTotals(food, 200);
    expect(result).toEqual({
      totalKcal: 200,
      totalProtein: 20,
      totalFat: 10,
      totalCarbs: 40,
    });
  });

  test('rounds to 2 decimal places', () => {
    const oddFood = { kcalPer100g: 33, proteinPer100g: 7, fatPer100g: 3, carbsPer100g: 11 };
    const result = calculateMacroTotals(oddFood, 150);
    expect(result.totalKcal).toBe(49.5);
    expect(result.totalProtein).toBe(10.5);
    expect(result.totalFat).toBe(4.5);
    expect(result.totalCarbs).toBe(16.5);
  });

  test('returns zeros for 0g quantity', () => {
    const result = calculateMacroTotals(food, 0);
    expect(result).toEqual({
      totalKcal: 0,
      totalProtein: 0,
      totalFat: 0,
      totalCarbs: 0,
    });
  });

  test('result values are Numbers not strings', () => {
    const result = calculateMacroTotals(food, 100);
    expect(typeof result.totalKcal).toBe('number');
    expect(typeof result.totalProtein).toBe('number');
  });
});
