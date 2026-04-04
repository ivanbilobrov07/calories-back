import api from './axios';

export const getLogs = (date) => api.get('/api/logs', { params: { date } });

export const createLog = (data) => api.post('/api/logs', data);

export const updateLog = (id, data) => api.put(`/api/logs/${id}`, data);

export const deleteLog = (id) => api.delete(`/api/logs/${id}`);

export const getPaginatedLogs = (page) =>
    api.get('/api/logs/paginated', { params: { page } });
