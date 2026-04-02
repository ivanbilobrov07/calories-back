const axios = require('axios');
const { prisma } = require('../prisma/client');
const { createAppError } = require('../utils/appError');

const searchFoods = async (query, userId) => {
  const internal = await prisma.food.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' },
      OR: [{ createdByUserId: null }, { createdByUserId: userId }]
    },
    orderBy: { name: 'asc' },
    take: 15
  });

  let external = [];
  try {
    const { data } = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        action: 'process',
        search_terms: query,
        json: 1,
        fields: 'product_name,nutriments',
        page_size: 10
      },
      timeout: 5000
    });
    external = (data?.products || [])
      .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'] != null)
      .map(p => ({
        id: null,
        name: p.product_name,
        kcalPer100g: Math.round(p.nutriments['energy-kcal_100g'] || 0),
        proteinPer100g: Math.round((p.nutriments['proteins_100g'] || 0) * 10) / 10,
        fatPer100g: Math.round((p.nutriments['fat_100g'] || 0) * 10) / 10,
        carbsPer100g: Math.round((p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        source: 'openfoodfacts'
      }))
      .slice(0, 10);
  } catch {
    // OpenFoodFacts unavailable — return internal only
  }

  return { internal, external };
};

const createCustomFood = async ({ name, kcalPer100g, proteinPer100g, fatPer100g, carbsPer100g }, userId) => {
  if (!name || kcalPer100g == null) throw createAppError('name and kcalPer100g are required', 400);

  const food = await prisma.food.create({
    data: {
      name,
      kcalPer100g: Number(kcalPer100g),
      proteinPer100g: Number(proteinPer100g) || 0,
      fatPer100g: Number(fatPer100g) || 0,
      carbsPer100g: Number(carbsPer100g) || 0,
      source: 'custom',
      createdByUserId: userId
    }
  });
  return food;
};

module.exports = { searchFoods, createCustomFood };
