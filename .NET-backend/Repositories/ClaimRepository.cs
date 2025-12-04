using Microsoft.EntityFrameworkCore;
using InsuranceAPI.Data;
using InsuranceAPI.Models;

namespace InsuranceAPI.Repositories
{
    public class ClaimRepository : IClaimRepository
    {
        private readonly AppDbContext _context;
        public ClaimRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Claim>> GetClaimsByUserAsync(string userId)
        {
            return await _context.Claims.Where(c => c.UserId == userId).ToListAsync();
        }

        public async Task<Claim> GetClaimAsync(long id)
        {
            return await _context.Claims.FindAsync(id);
        }

        public async Task AddClaimAsync(Claim claim)
        {
            await _context.Claims.AddAsync(claim);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateClaimAsync(Claim claim)
        {
            _context.Claims.Update(claim);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteClaimAsync(long id)
        {
            var claim = await _context.Claims.FindAsync(id);
            if (claim != null)
            {
                _context.Claims.Remove(claim);
                await _context.SaveChangesAsync();
            }
        }
    }
}
