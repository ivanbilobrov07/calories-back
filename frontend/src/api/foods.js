import api from './axios';

export const searchFoods = (q) =>
  api.get('/api/foods/search', { params: { q } });

export const createCustomFood = (data) =>
  api.post('/api/foods/custom', data);
