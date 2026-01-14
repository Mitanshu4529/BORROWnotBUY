import api from './api';

export const userService = {
  getUserProfile: (userId) => api.get(`/users/profile/${userId}`),
  getUserStats: () => api.get('/users/stats'),
};
