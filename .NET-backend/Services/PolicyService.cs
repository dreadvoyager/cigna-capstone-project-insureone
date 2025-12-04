using InsuranceAPI.DTOs.Admin;
using InsuranceAPI.Models;
using InsuranceAPI.Repositories;

namespace InsuranceAPI.Services
{

    public class PolicyService : IPolicyService
    {
        private readonly IPolicyRepository _policyRepo;
        public PolicyService(IPolicyRepository policyRepo)
        {
            _policyRepo = policyRepo;
        }

        public async Task<IEnumerable<Policy>> GetPolicies(string userId) => await _policyRepo.GetPoliciesByUserAsync(userId);
        public async Task<Policy> GetPolicy(long id) => await _policyRepo.GetPolicyAsync(id);
        public async Task AddPolicy(Policy policy) => await _policyRepo.AddPolicyAsync(policy);
        public async Task<Policy> UpdatePolicy(long id, PolicyUpdateDto dto)
        {

            var policy = await _policyRepo.GetPolicyAsync(id);
            if (policy == null) return null;

            policy.Insurer = dto.Insurer;
            policy.PolicyType = dto.PolicyType;
            policy.PremiumAmt = dto.PremiumAmt;
            policy.StartDate = dto.StartDate;
            policy.EndDate = dto.EndDate;
            policy.Status = dto.Status;


            await _policyRepo.UpdatePolicyAsync(policy);

            return policy;
        }
        public async Task DeletePolicy(long id)
        {
            var policy = await _policyRepo.GetPolicyAsync(id);
            if (policy == null) throw new Exception("Policy not found");
            await _policyRepo.DeletePolicyAsync(id);

        }

    }
    
}
