using InsuranceAPI.Data;
using InsuranceAPI.DTOs.Admin;
using InsuranceAPI.Models;
using InsuranceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InsuranceAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IPolicyService _policyService;
        private readonly IClaimService _claimService;

        public AdminController(UserManager<ApplicationUser> userManager, IPolicyService policyService, IClaimService claimService)
        {
            _policyService = policyService;
            _claimService = claimService;
            _userManager = userManager;
        }

        // ---------------- USERS ----------------
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .Select(u => new { u.Id, u.UserName, u.FullName })
                .ToListAsync();
            return Ok(users);
        }

        // ---------------- POLICIES ----------------
        [HttpGet("users/{userId}/policies")]
        public async Task<IActionResult> GetPoliciesForUser(string userId)
        {
            var policies = await _policyService.GetPolicies(userId);
            return Ok(policies);
        }

        [HttpPut("policies/{id}")]
        public async Task<IActionResult> UpdatePolicy(long id, PolicyUpdateDto dto)
        {
            var updated = await _policyService.UpdatePolicy(id, dto);
            return Ok(updated);
        }

        [HttpDelete("policies/{id}")]
        public async Task<IActionResult> DeletePolicy(long id)
        {

            await _policyService.DeletePolicy(id);
            return NoContent();
        }

        // ---------------- CLAIMS ----------------
        [HttpGet("users/{userId}/claims")]
        public async Task<IActionResult> GetClaimsForUser(string userId)
        {
            var claims = await _claimService.GetClaims(userId);
            return Ok(claims);
        }

        [HttpPut("claims/{id}")]
        public async Task<IActionResult> UpdateClaimStatus(long id, ClaimStatusUpdateDto dto)
        {
            var updated = await _claimService.UpdateClaimStatus(id, dto);
            if (updated == null) return NotFound();

            return Ok(updated);
        }

        [HttpDelete("claims/{id}")]
        public async Task<IActionResult> DeleteClaim(long id)
        {
            var deleted = await _claimService.GetClaim(id);
            if (deleted == null) return NotFound();
            await _claimService.DeleteClaim(id);
            return NoContent();
        }
    }
}








