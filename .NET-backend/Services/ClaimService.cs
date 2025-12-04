using InsuranceAPI.DTOs;
using InsuranceAPI.DTOs.Admin;
using InsuranceAPI.Models;
using InsuranceAPI.Repositories;

namespace InsuranceAPI.Services
{
    // Services/ClaimService.cs
    public class ClaimService : IClaimService
    {
        private readonly IClaimRepository _claimRepo;
        public ClaimService(IClaimRepository claimRepo)
        {
            _claimRepo = claimRepo;
        }

        public async Task<IEnumerable<Claim>> GetClaims(string userId) => await _claimRepo.GetClaimsByUserAsync(userId);

        public async Task<Claim> GetClaim(long id) => await _claimRepo.GetClaimAsync(id);

        public async Task AddClaim(Claim claim) => await _claimRepo.AddClaimAsync(claim);

        public async Task<Claim?> UpdateClaim(long id, ClaimUpdateDto dto)
        {
            var claims = await _claimRepo.GetClaimAsync(id);
            if (claims == null) return null;

            claims.ClaimAmt = dto.ClaimAmt;
            claims.Description = dto.Description;
            claims.Status = dto.Status;

            await _claimRepo.UpdateClaimAsync(claims);
            return claims;
        }

        public async Task<Claim?> UpdateClaimStatus(long id, ClaimStatusUpdateDto dto)
        {
            var claims = await _claimRepo.GetClaimAsync(id);
            if (claims == null) return null;

            claims.Status = dto.Status;

            await _claimRepo.UpdateClaimAsync(claims);
            return claims;
        }

        public async Task DeleteClaim(long id) => await _claimRepo.DeleteClaimAsync(id);
    }

}
