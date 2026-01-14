import api from './api';

export const authService = {
  requestOTP: (phone) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone, otp, name, location, upi) => 
    api.post('/auth/verify-otp', { phone, otp, name, location, upi }),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
