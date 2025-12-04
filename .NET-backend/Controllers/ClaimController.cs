using InsuranceAPI.DTOs;
using InsuranceAPI.Models;
using InsuranceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceAPI.Controllers
{
    [ApiController]
    [Route("api/claims")]
    [Authorize]
    public class ClaimController : ControllerBase
    {
        private readonly IClaimService _claimService;
 
        public ClaimController(IClaimService claimService)
        {
            _claimService = claimService;

        }
        
        [HttpGet]
        public async Task<IActionResult> GetClaims()
        {
           
            var userId = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found.");

            var claims = await _claimService.GetClaims(userId);
            return Ok(claims);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClaim(long id)
        {
            var claim = await _claimService.GetClaim(id);
            if (claim == null) return NotFound();
            return Ok(claim);
        }

        [HttpPost]
        public async Task<IActionResult> CreateClaim([FromBody] Claim claim)
        {
            await _claimService.AddClaim(claim);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClaim(long id, ClaimUpdateDto dto)
        {

            var updated = await _claimService.UpdateClaim(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClaim(long id)
        {
            await _claimService.DeleteClaim(id);
            return Ok();
        }
    }

}
