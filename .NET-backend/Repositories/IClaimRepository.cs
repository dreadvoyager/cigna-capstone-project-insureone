using System.Collections.Generic;
using System.Threading.Tasks;
using InsuranceAPI.Models;

namespace InsuranceAPI.Repositories
{

    public interface IClaimRepository
    {
        Task<IEnumerable<Claim>> GetClaimsByUserAsync(string userId);

        Task<Claim> GetClaimAsync(long id);

        Task AddClaimAsync(Claim claim);
        
        //Admin helpers
        Task UpdateClaimAsync(Claim claim);

        Task DeleteClaimAsync(long id);

    }

}
