import api from './axios';

export const getProfile = () =>
  api.get('/api/users/profile');

export const updateProfile = (data) =>
  api.put('/api/users/profile', data);
