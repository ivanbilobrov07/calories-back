const { prisma } = require('../prisma/client');

const getWeeklyStats = async (userId) => {
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const startDate = new Date(`${days[0]}T00:00:00.000Z`);
  const endDate = new Date(`${days[6]}T00:00:00.000Z`);
  endDate.setDate(endDate.getDate() + 1);

  const logs = await prisma.mealLog.findMany({
    where: { userId, logDate: { gte: startDate, lt: endDate } }
  });

  const totals = Object.fromEntries(days.map(d => [d, 0]));
  for (const log of logs) {
    const key = new Date(log.logDate).toISOString().slice(0, 10);
    if (key in totals) totals[key] += log.totalKcal;
  }

  return days.map(date => ({ date, totalKcal: Math.round(totals[date]) }));
};

module.exports = { getWeeklyStats };
