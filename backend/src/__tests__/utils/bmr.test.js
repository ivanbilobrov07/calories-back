const { calculateDailyGoalKcal, ACTIVITY_MULTIPLIERS } = require('../../utils/bmr');

describe('ACTIVITY_MULTIPLIERS', () => {
  test('has sedentary multiplier 1.2', () => {
    expect(ACTIVITY_MULTIPLIERS.sedentary).toBe(1.2);
  });

  test('has all four activity levels', () => {
    expect(Object.keys(ACTIVITY_MULTIPLIERS)).toEqual(['sedentary', 'light', 'moderate', 'active']);
  });
});

describe('calculateDailyGoalKcal', () => {
  const maleMod = { sex: 'male', age: 30, weightKg: 80, heightCm: 180, activityLevel: 'moderate' };
  // base = 10*80 + 6.25*180 - 5*30 = 800 + 1125 - 150 = 1775; bmr = 1775+5 = 1780; 1780*1.55 = 2759
  const femaleLight = { sex: 'female', age: 25, weightKg: 60, heightCm: 165, activityLevel: 'light' };
  // base = 10*60 + 6.25*165 - 5*25 = 600 + 1031.25 - 125 = 1506.25; bmr = 1506.25-161 = 1345.25; 1345.25*1.375 = 1849.72 → 1850

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

  test('returns null when age is missing', () => {
    const { age, ...rest } = maleMod;
    expect(calculateDailyGoalKcal(rest)).toBeNull();
  });

  test('returns null when any required field is missing', () => {
    expect(calculateDailyGoalKcal({ sex: 'male', age: 30 })).toBeNull();
  });

  test('returns a rounded integer', () => {
    const result = calculateDailyGoalKcal(maleMod);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('unknown activityLevel defaults to sedentary multiplier', () => {
    const data = { sex: 'male', age: 30, weightKg: 80, heightCm: 180, activityLevel: 'unknown' };
    const expected = Math.round(1780 * ACTIVITY_MULTIPLIERS.sedentary);
    expect(calculateDailyGoalKcal(data)).toBe(expected);
  });

  test('female gets -161 sex adjustment', () => {
    const female = { sex: 'female', age: 30, weightKg: 80, heightCm: 180, activityLevel: 'sedentary' };
    const male = { sex: 'male', age: 30, weightKg: 80, heightCm: 180, activityLevel: 'sedentary' };
    // difference should be (5 - (-161)) * 1.2 = 166 * 1.2 = 199.2 → 199 after rounding
    const diff = calculateDailyGoalKcal(male) - calculateDailyGoalKcal(female);
    expect(diff).toBeCloseTo(199, 0);
  });
});
