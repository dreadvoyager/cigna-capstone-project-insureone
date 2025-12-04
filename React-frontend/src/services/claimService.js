import api from '../config/api';

export const claimService = {
  getAllClaims: async () => {
    const response = await api.get('/claims');
    return response.data;
  },

  getClaimById: async (id) => {
    const response = await api.get(`/claims/${id}`);
    return response.data;
  },

  createClaim: async (claimData) => {
    const response = await api.post('/claims', claimData);
    return response.data;
  },

  updateClaim: async (id, claimData) => {
    const response = await api.put(`/claims/${id}`, claimData);
    return response.data;
  },

  deleteClaim: async (id) => {
    const response = await api.delete(`/claims/${id}`);
    return response.data;
  },
};
