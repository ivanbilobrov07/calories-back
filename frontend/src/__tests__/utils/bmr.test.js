import { calculateDailyGoalKcal } from '../../utils/bmr';

describe('calculateDailyGoalKcal', () => {
  const maleMod = { sex: 'male', age: 30, weightKg: 80, heightCm: 180, activityLevel: 'moderate' };
  // base=1775, sexAdj=5, bmr=1780, *1.55 = 2759
  const femaleLight = { sex: 'female', age: 25, weightKg: 60, heightCm: 165, activityLevel: 'light' };
  // base=1506.25, sexAdj=-161, bmr=1345.25, *1.375 = 1849.72 → 1850

  test('calculates correctly for male with moderate activity', () => {
    expect(calculateDailyGoalKcal(maleMod)).toBe(2759);
  });

  test('calculates correctly for female with light activity', () => {
    expect(calculateDailyGoalKcal(femaleLight)).toBe(1850);
  });

  test('returns null when sex is missing', () => {
    const { sex, ...rest } = maleMod;
    expect(calculateDailyGoalKcal(rest)).toBeNull();
  });

  test('returns null when age is zero/falsy', () => {
    expect(calculateDailyGoalKcal({ ...maleMod, age: 0 })).toBeNull();
  });

  test('returns null when heightCm is missing', () => {
    const { heightCm, ...rest } = maleMod;
    expect(calculateDailyGoalKcal(rest)).toBeNull();
  });

  test('returns a rounded integer', () => {
    const result = calculateDailyGoalKcal(maleMod);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('uses sedentary multiplier for unknown activityLevel', () => {
    const result = calculateDailyGoalKcal({ ...maleMod, activityLevel: 'unknown' });
    // bmr=1780, *1.2 = 2136
    expect(result).toBe(2136);
  });

  test('active level produces highest calorie goal', () => {
    const active = calculateDailyGoalKcal({ ...maleMod, activityLevel: 'active' });
    const sedentary = calculateDailyGoalKcal({ ...maleMod, activityLevel: 'sedentary' });
    expect(active).toBeGreaterThan(sedentary);
  });
});
