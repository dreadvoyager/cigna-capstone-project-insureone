import api from "../config/api";

export const adminService = {
  // -------------------------
  // USERS
  // -------------------------
  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  getPoliciesForUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/policies`);
    return response.data;
  },

  // -------------------------
  // POLICIES
  // -------------------------
  updatePolicy: async (policyId, policyData) => {
    const response = await api.put(`/admin/policies/${policyId}`, policyData);
    return response.data;
  },

  deletePolicy: async (policyId) => {
    const response = await api.delete(`/admin/policies/${policyId}`);
    return response.data;
  },

  // -------------------------
  // CLAIMS
  // -------------------------
  getClaimsForUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/claims`);
    return response.data;
  },

  updateClaimStatus: async (claimId, statusData) => {
    const response = await api.put(`/admin/claims/${claimId}`, statusData);
    return response.data;
  },

  deleteClaim: async (claimId) => {
    const response = await api.delete(`/admin/claims/${claimId}`);
    return response.data;
  },
};