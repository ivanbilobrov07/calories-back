import api from './axios';

export const register = (email, password) =>
  api.post('/api/auth/register', { email, password });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const logout = () =>
  api.post('/api/auth/logout');
