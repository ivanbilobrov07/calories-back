const { prisma } = require('../prisma/client');
const { calculateDailyGoalKcal } = require('../utils/bmr');
const { createAppError } = require('../utils/appError');

const USER_SELECT = {
  id: true, email: true, name: true, sex: true, age: true,
  weightKg: true, heightCm: true, activityLevel: true, dailyGoalKcal: true,
  createdAt: true
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT });
  if (!user) throw createAppError('User not found', 404);
  return user;
};

const updateProfile = async (userId, data) => {
  const { name, sex, age, weightKg, heightCm, activityLevel, dailyGoalKcal } = data;

  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) throw createAppError('User not found', 404);

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (sex !== undefined) updateData.sex = sex;
  if (age !== undefined) updateData.age = Number(age);
  if (weightKg !== undefined) updateData.weightKg = Number(weightKg);
  if (heightCm !== undefined) updateData.heightCm = Number(heightCm);
  if (activityLevel !== undefined) updateData.activityLevel = activityLevel;

  if (dailyGoalKcal !== undefined && dailyGoalKcal !== null && dailyGoalKcal !== '') {
    updateData.dailyGoalKcal = Number(dailyGoalKcal);
  } else {
    const merged = {
      sex: sex ?? current.sex,
      age: age ?? current.age,
      weightKg: weightKg ?? current.weightKg,
      heightCm: heightCm ?? current.heightCm,
      activityLevel: activityLevel ?? current.activityLevel
    };
    const calculated = calculateDailyGoalKcal(merged);
    if (calculated) updateData.dailyGoalKcal = calculated;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: USER_SELECT
  });
  return user;
};

module.exports = { getProfile, updateProfile };
