const foodService = require('../services/foodService');

const searchFoods = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ error: 'Query parameter q is required' });
    const results = await foodService.searchFoods(q.trim(), req.user.id);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

const createCustomFood = async (req, res, next) => {
  try {
    const food = await foodService.createCustomFood(req.body, req.user.id);
    res.status(201).json(food);
  } catch (err) {
    next(err);
  }
};

module.exports = { searchFoods, createCustomFood };
