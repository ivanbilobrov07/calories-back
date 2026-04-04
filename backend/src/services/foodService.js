const axios = require('axios');
const { prisma } = require('../prisma/client');
const { createAppError } = require('../utils/appError');

const searchFoods = async (query, userId) => {
    console.log(
        'Searching for foods with query:',
        query,
        'and userId:',
        userId,
    );

    const internal = await prisma.food.findMany({
        where: {
            name: { contains: query, mode: 'insensitive' },
            source: 'custom',
            OR: [{ createdByUserId: null }, { createdByUserId: userId }],
        },
        orderBy: { name: 'asc' },
        take: 15,
    });

    let external = [];
    try {
        const { data } = await axios.get(
            'https://api.nal.usda.gov/fdc/v1/foods/search',
            {
                params: {
                    query,
                    pageSize: 10,
                    api_key: process.env.FOOD_API_KEY,
                },
            },
        );

        console.log(data);

        external = data.foods.map((food) => {
            const get = (name) =>
                food.foodNutrients.find((n) => n.nutrientName === name)
                    ?.value ?? 0;

            return {
                name: food.description,
                kcalPer100g: get('Energy'),
                proteinPer100g: get('Protein'),
                fatPer100g: get('Total lipid (fat)'),
                carbsPer100g: get('Carbohydrate, by difference'),
            };
        });
    } catch (e) {
        console.log(e);
        // OpenFoodFacts unavailable — return internal only
    }

    return { internal, external };
};

const createCustomFood = async (
    { name, kcalPer100g, proteinPer100g, fatPer100g, carbsPer100g },
    userId,
) => {
    if (!name || kcalPer100g == null)
        throw createAppError('name and kcalPer100g are required', 400);

    const food = await prisma.food.create({
        data: {
            name,
            kcalPer100g: Number(kcalPer100g),
            proteinPer100g: Number(proteinPer100g) || 0,
            fatPer100g: Number(fatPer100g) || 0,
            carbsPer100g: Number(carbsPer100g) || 0,
            source: 'custom',
            createdByUserId: userId,
        },
    });
    return food;
};

module.exports = { searchFoods, createCustomFood };
