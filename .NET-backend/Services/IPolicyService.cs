// Services/IPolicyService.cs
using InsuranceAPI.DTOs.Admin;
using InsuranceAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InsuranceAPI.Services
{
    public interface IPolicyService
    {
        Task<IEnumerable<Policy>> GetPolicies(string userId);
        Task<Policy?> GetPolicy(long id);
        Task AddPolicy(Policy policy);
        Task<Policy?> UpdatePolicy(long id, PolicyUpdateDto dto);
        Task DeletePolicy(long id);
    }

}
