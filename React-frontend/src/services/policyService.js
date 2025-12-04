import api from '../config/api';

export const policyService = {
  getAllPolicies: async () => {
    const response = await api.get('/policies');
    return response.data;
  },

  getPolicyById: async (id) => {
    const response = await api.get(`/policies/${id}`);
    return response.data;
  },

  createPolicy: async (policyData) => {
    console.log(policyData);
    const response = await api.post('/policies', policyData);
    
    return response.data;
  },

  updatePolicy: async (id, policyData) => {
    const response = await api.put(`/policies/${id}`, policyData);
    return response.data;
  },

  deletePolicy: async (id) => {
    const response = await api.delete(`/policies/${id}`);
    return response.data;
  },
  
getExpiringPolicies: async () => {
  const response = await api.get('/policies/expiring-soon'); // ✅ Adjust endpoint
  return response.data;
},

};
