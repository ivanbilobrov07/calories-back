const statsService = require('../services/statsService');

const getWeeklyStats = async (req, res, next) => {
  try {
    const stats = await statsService.getWeeklyStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeeklyStats };
