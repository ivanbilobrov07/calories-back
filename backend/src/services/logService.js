const { prisma } = require('../prisma/client');
const { calculateMacroTotals } = require('../utils/nutrition');
const { createAppError } = require('../utils/appError');

const LOG_INCLUDE = {
  food: { select: { id: true, name: true, kcalPer100g: true, proteinPer100g: true, fatPer100g: true, carbsPer100g: true, source: true } }
};

const getLogsForDate = async (userId, date) => {
  const logDate = new Date(`${date}T00:00:00.000Z`);
  return prisma.mealLog.findMany({
    where: { userId, logDate },
    include: LOG_INCLUDE,
    orderBy: { createdAt: 'asc' }
  });
};

const createLog = async (userId, { foodId, externalFood, quantityG, mealType, logDate }) => {
  if (!quantityG || !mealType || !logDate) {
    throw createAppError('quantityG, mealType and logDate are required', 400);
  }

  let food;

  if (foodId) {
    food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food) throw createAppError('Food not found', 404);
  } else if (externalFood) {
    // Reuse existing openfoodfacts entry by name to avoid duplicates
    food = await prisma.food.findFirst({
      where: { name: externalFood.name, source: 'openfoodfacts' }
    });
    if (!food) {
      food = await prisma.food.create({
        data: {
          name: externalFood.name,
          kcalPer100g: Number(externalFood.kcalPer100g),
          proteinPer100g: Number(externalFood.proteinPer100g) || 0,
          fatPer100g: Number(externalFood.fatPer100g) || 0,
          carbsPer100g: Number(externalFood.carbsPer100g) || 0,
          source: 'openfoodfacts'
        }
      });
    }
  } else {
    throw createAppError('foodId or externalFood is required', 400);
  }

  const totals = calculateMacroTotals(food, Number(quantityG));
  return prisma.mealLog.create({
    data: {
      userId,
      foodId: food.id,
      quantityG: Number(quantityG),
      ...totals,
      mealType,
      logDate: new Date(`${logDate}T00:00:00.000Z`)
    },
    include: LOG_INCLUDE
  });
};

const updateLog = async (userId, logId, { quantityG, mealType }) => {
  const existing = await prisma.mealLog.findUnique({ where: { id: logId } });
  if (!existing) throw createAppError('Log entry not found', 404);
  if (existing.userId !== userId) throw createAppError('Forbidden', 403);

  const food = await prisma.food.findUnique({ where: { id: existing.foodId } });
  const qty = quantityG !== undefined ? Number(quantityG) : existing.quantityG;
  const totals = calculateMacroTotals(food, qty);

  return prisma.mealLog.update({
    where: { id: logId },
    data: { quantityG: qty, ...totals, ...(mealType && { mealType }) },
    include: LOG_INCLUDE
  });
};

const deleteLog = async (userId, logId) => {
  const existing = await prisma.mealLog.findUnique({ where: { id: logId } });
  if (!existing) throw createAppError('Log entry not found', 404);
  if (existing.userId !== userId) throw createAppError('Forbidden', 403);
  await prisma.mealLog.delete({ where: { id: logId } });
};

module.exports = { getLogsForDate, createLog, updateLog, deleteLog };
