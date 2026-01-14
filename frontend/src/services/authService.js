import api from './api';

export const authService = {
  requestOTP: (phone, email, upi) => api.post('/auth/request-otp', { phone, email, upi }),
  verifyOTP: (phone, otp, name, location, upi, email) => 
    api.post('/auth/verify-otp', { phone, otp, name, location, upi, email }),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
