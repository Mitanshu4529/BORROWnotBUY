import api from './api';

export const itemService = {
  getItems: (query) => api.get('/items', { params: query }),
  getItemById: (id) => api.get(`/items/${id}`),
  createItem: (data) => api.post('/items', data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
};
