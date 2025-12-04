using InsuranceAPI.DTOs;
using InsuranceAPI.DTOs.Admin;
using InsuranceAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace InsuranceAPI.Services
{  
    public interface IClaimService
    {
        Task<IEnumerable<Claim>> GetClaims(string userId);
        Task<Claim> GetClaim(long id);
        Task AddClaim(Claim claim);
        Task<Claim> UpdateClaim(long id, ClaimUpdateDto dto);
        Task<Claim> UpdateClaimStatus(long id, ClaimStatusUpdateDto dto);
        Task DeleteClaim(long id);
    }

}
