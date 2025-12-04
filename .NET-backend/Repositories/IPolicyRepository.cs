
using System.Collections.Generic;
using System.Threading.Tasks;
using InsuranceAPI.Models;

namespace InsuranceAPI.Repositories
{
    public interface IPolicyRepository
    {
        Task<IEnumerable<Policy>> GetPoliciesByUserAsync(string userId);

        Task<Policy?> GetPolicyAsync(long id);

        Task AddPolicyAsync(Policy policy);

        Task UpdatePolicyAsync(Policy policy);

        Task DeletePolicyAsync(long id);

    }

}
