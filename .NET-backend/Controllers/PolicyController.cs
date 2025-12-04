using InsuranceAPI.DTOs.Admin;
using InsuranceAPI.Models;
using InsuranceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceAPI.Controllers
{
    [ApiController]
    [Route("api/policies")]
    [Authorize]
    public class PolicyController : ControllerBase
    {
        private readonly IPolicyService _policyService;
        public PolicyController(IPolicyService policyService)
        {
            _policyService = policyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPolicies()
        {
            var userId = User.FindFirst("id").Value;
            var policies = await _policyService.GetPolicies(userId);
            return Ok(policies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPolicy(long id)
        {
            var policy = await _policyService.GetPolicy(id);
            if (policy == null) return NotFound();
            return Ok(policy);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePolicy([FromBody] Policy policy)
        {
            await _policyService.AddPolicy(policy);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePolicy(long id, [FromBody] PolicyUpdateDto dto)
        {

            var updated = await _policyService.UpdatePolicy(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
    }

}
