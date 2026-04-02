import api from './axios';

export const getWeeklyStats = () =>
  api.get('/api/stats/weekly');
