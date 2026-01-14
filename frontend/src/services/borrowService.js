import api from './api';

export const borrowService = {
  createBorrowRequest: (data) => api.post('/borrows', data),
  getActiveBorrows: () => api.get('/borrows/active'),
  getBorrowHistory: () => api.get('/borrows/history'),
  approveBorrowRequest: (borrowId, data) => api.put(`/borrows/${borrowId}/approve`, data),
  markAsReturned: (borrowId, data) => api.put(`/borrows/${borrowId}/return`, data),
};
