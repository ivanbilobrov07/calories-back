const logService = require('../services/logService');

const getLogs = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
    const logs = await logService.getLogsForDate(req.user.id, date);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

const createLog = async (req, res, next) => {
  try {
    const log = await logService.createLog(req.user.id, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

const updateLog = async (req, res, next) => {
  try {
    const log = await logService.updateLog(req.user.id, req.params.id, req.body);
    res.json(log);
  } catch (err) {
    next(err);
  }
};

const deleteLog = async (req, res, next) => {
  try {
    await logService.deleteLog(req.user.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs, createLog, updateLog, deleteLog };
