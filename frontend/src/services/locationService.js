import api from './api';

export const locationService = {
  getNearbyItems: (latitude, longitude, radius, category) =>
    api.get('/locations/nearby-items', {
      params: { latitude, longitude, radius, category },
    }),
  getNearbyUsers: (latitude, longitude, radius) =>
    api.get('/locations/nearby-users', {
      params: { latitude, longitude, radius },
    }),
};
