using Microsoft.EntityFrameworkCore;
using InsuranceAPI.Data;
using InsuranceAPI.Models;


namespace InsuranceAPI.Repositories
{


    public class PolicyRepository : IPolicyRepository
    {
        private readonly AppDbContext _context;
        public PolicyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Policy>> GetPoliciesByUserAsync(string userId)
        {
            return await _context.Policies.Where(p => p.UserId == userId).ToListAsync();
        }

        public async Task<Policy> GetPolicyAsync(long id)
        {
            return await _context.Policies.FindAsync(id);
        }

        public async Task AddPolicyAsync(Policy policy)
        {
            await _context.Policies.AddAsync(policy);
            await _context.SaveChangesAsync();
        }

        public async Task UpdatePolicyAsync(Policy policy)
        {
            _context.Policies.Update(policy);
            await _context.SaveChangesAsync();
        }

        public async Task DeletePolicyAsync(long id)
        {
            var policy = await _context.Policies.FirstOrDefaultAsync(p => p.PolicyId == id);
            if (policy != null)
            {
                _context.Policies.Remove(policy);
                await _context.SaveChangesAsync();
            }

        }
    }

}
