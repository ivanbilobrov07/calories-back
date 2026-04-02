const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725
};

export function calculateDailyGoalKcal({ sex, age, weightKg, heightCm, activityLevel }) {
  if (!sex || !age || !weightKg || !heightCm || !activityLevel) return null;
  const base = 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age);
  const sexAdjustment = sex === 'male' ? 5 : -161;
  const bmr = base + sexAdjustment;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.sedentary;
  return Math.round(bmr * multiplier);
}
