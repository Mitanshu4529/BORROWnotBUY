import api from './api';

export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/${userId}`),
};
