const { prisma } = require('../prisma/client');
const { calculateMacroTotals } = require('../utils/nutrition');
const { createAppError } = require('../utils/appError');

const LOG_INCLUDE = {
    items: {
        include: {
            food: {
                select: {
                    id: true,
                    name: true,
                    kcalPer100g: true,
                    proteinPer100g: true,
                    fatPer100g: true,
                    carbsPer100g: true,
                    source: true,
                },
            },
        },
    },
};

const getLogsForDate = async (userId, date) => {
    const logDate = new Date(`${date}T00:00:00.000Z`);
    return prisma.mealLog.findMany({
        where: { userId, logDate },
        include: LOG_INCLUDE,
        orderBy: { createdAt: 'asc' },
    });
};

const getPaginatedLogs = async (userId, page, limit) => {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        prisma.mealLog.findMany({
            where: { userId },
            include: LOG_INCLUDE,
            orderBy: { logDate: 'desc' },
            skip,
            take: limit,
        }),
        prisma.mealLog.count({ where: { userId } }),
    ]);

    return { items, total, page, hasMore: skip + items.length < total };
};

const resolveFood = async (item) => {
    if (item.foodId) {
        const food = await prisma.food.findUnique({
            where: { id: item.foodId },
        });
        if (!food) throw createAppError(`Food ${item.foodId} not found`, 404);
        return food;
    }

    if (item.externalFood) {
        const existing = await prisma.food.findFirst({
            where: { name: item.externalFood.name, source: 'openfoodfacts' },
        });
        if (existing) return existing;

        return prisma.food.create({
            data: {
                name: item.externalFood.name,
                kcalPer100g: Number(item.externalFood.kcalPer100g),
                proteinPer100g: Number(item.externalFood.proteinPer100g) || 0,
                fatPer100g: Number(item.externalFood.fatPer100g) || 0,
                carbsPer100g: Number(item.externalFood.carbsPer100g) || 0,
                source: 'openfoodfacts',
            },
        });
    }

    throw createAppError('Each item requires foodId or externalFood', 400);
};

const createLog = async (userId, { items, mealType, logDate }) => {
    if (!items?.length || !mealType || !logDate) {
        throw createAppError('items, mealType and logDate are required', 400);
    }

    const foods = await Promise.all(items.map(resolveFood));

    const totals = foods.reduce(
        (acc, food, i) => {
            const qty = Number(items[i].quantityG);
            const macros = calculateMacroTotals(food, qty);
            return {
                totalKcal: acc.totalKcal + macros.totalKcal,
                totalProtein: acc.totalProtein + macros.totalProtein,
                totalFat: acc.totalFat + macros.totalFat,
                totalCarbs: acc.totalCarbs + macros.totalCarbs,
            };
        },
        { totalKcal: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
    );

    return prisma.mealLog.create({
        data: {
            userId,
            ...totals,
            mealType,
            logDate: new Date(`${logDate}T00:00:00.000Z`),
            items: {
                create: foods.map((food, i) => ({
                    foodId: food.id,
                    quantityG: Number(items[i].quantityG),
                })),
            },
        },
        include: LOG_INCLUDE,
    });
};

const updateLog = async (userId, logId, { items, mealType }) => {
    const existing = await prisma.mealLog.findUnique({ where: { id: logId } });
    if (!existing) throw createAppError('Log entry not found', 404);
    if (existing.userId !== userId) throw createAppError('Forbidden', 403);

    if (items?.length) {
        const foods = await Promise.all(items.map(resolveFood));

        const totals = foods.reduce(
            (acc, food, i) => {
                const macros = calculateMacroTotals(
                    food,
                    Number(items[i].quantityG),
                );
                return {
                    totalKcal: acc.totalKcal + macros.totalKcal,
                    totalProtein: acc.totalProtein + macros.totalProtein,
                    totalFat: acc.totalFat + macros.totalFat,
                    totalCarbs: acc.totalCarbs + macros.totalCarbs,
                };
            },
            { totalKcal: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
        );

        await prisma.mealLogItem.deleteMany({ where: { mealLogId: logId } });

        return prisma.mealLog.update({
            where: { id: logId },
            data: {
                ...totals,
                ...(mealType && { mealType }),
                items: {
                    create: foods.map((food, i) => ({
                        foodId: food.id,
                        quantityG: Number(items[i].quantityG),
                    })),
                },
            },
            include: LOG_INCLUDE,
        });
    }

    return prisma.mealLog.update({
        where: { id: logId },
        data: { ...(mealType && { mealType }) },
        include: LOG_INCLUDE,
    });
};

const deleteLog = async (userId, logId) => {
    const existing = await prisma.mealLog.findUnique({ where: { id: logId } });
    if (!existing) throw createAppError('Log entry not found', 404);
    if (existing.userId !== userId) throw createAppError('Forbidden', 403);
    await prisma.mealLog.delete({ where: { id: logId } });
};

module.exports = {
    getLogsForDate,
    getPaginatedLogs,
    createLog,
    updateLog,
    deleteLog,
};
