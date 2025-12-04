using InsuranceAPI.DTOs.Admin;
using InsuranceAPI.Models;
using InsuranceAPI.Repositories;
using InsuranceAPI.Services;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace InsuranceAPI.Tests
{
    public class PolicyServiceTests
    {
        private readonly Mock<IPolicyRepository> _mockRepo;
        private readonly PolicyService _service;

        public PolicyServiceTests()
        {
            _mockRepo = new Mock<IPolicyRepository>();
            _service = new PolicyService(_mockRepo.Object);
        }

        // ------------------------------------------------------------
        //  GetPolicies_ReturnsPoliciesForUser  (Positive)
        // ------------------------------------------------------------
        [Fact]
        public async Task GetPolicies_ReturnsPoliciesForUser()
        {
            string userId = "u1";

            var expected = new List<Policy>
            {
                new Policy { PolicyId = 1, UserId = userId },
                new Policy { PolicyId = 2, UserId = userId }
            };

            _mockRepo.Setup(r => r.GetPoliciesByUserAsync(userId))
                     .ReturnsAsync(expected);

            var result = await _service.GetPolicies(userId);

            Assert.Equal(expected, result);
            _mockRepo.Verify(r => r.GetPoliciesByUserAsync(userId), Times.Once);
        }

        // ------------------------------------------------------------
        // GetPolicy_ReturnsCorrectPolicy  (Positive)
        // ------------------------------------------------------------
        [Fact]
        public async Task GetPolicy_ReturnsCorrectPolicy()
        {
            long id = 10;
            var policy = new Policy { PolicyId = id };

            _mockRepo.Setup(r => r.GetPolicyAsync(id))
                     .ReturnsAsync(policy);

            var result = await _service.GetPolicy(id);

            Assert.Equal(policy, result);
            _mockRepo.Verify(r => r.GetPolicyAsync(id), Times.Once);
        }

        // ------------------------------------------------------------
        // GetPolicy_WhenNotFound_ReturnsNull (Negative)
        // ------------------------------------------------------------
        [Fact]
        public async Task GetPolicy_WhenNotFound_ReturnsNull()
        {
            long id = 404;

            _mockRepo.Setup(r => r.GetPolicyAsync(id))
                     .ReturnsAsync((Policy?)null);

            var result = await _service.GetPolicy(id);

            Assert.Null(result);
            _mockRepo.Verify(r => r.GetPolicyAsync(id), Times.Once);
        }

        // ------------------------------------------------------------
        //  AddPolicy_CallsRepositoryOnce (Positive)
        // ------------------------------------------------------------
        [Fact]
        public async Task AddPolicy_CallsRepositoryOnce()
        {
            var policy = new Policy { PolicyId = 5 };

            _mockRepo.Setup(r => r.AddPolicyAsync(policy))
                     .Returns(Task.CompletedTask);

            await _service.AddPolicy(policy);

            _mockRepo.Verify(r => r.AddPolicyAsync(policy), Times.Once);
        }

        // ------------------------------------------------------------
        // UpdatePolicy_UpdatesSuccessfully (Positive)
        // ------------------------------------------------------------
        [Fact]
        public async Task UpdatePolicy_UpdatesSuccessfully()
        {
            long id = 20;

            var existing = new Policy
            {
                PolicyId = id,
                Insurer = "LIC",
                PolicyType = "Health",
                PremiumAmt = 5000
            };

            var dto = new PolicyUpdateDto
            {
                Insurer = "HDFC",
                PolicyType = "Life",
                PremiumAmt = 8000,
                StartDate = DateTime.Today,
                EndDate = DateTime.Today.AddYears(5),
                Status = "Active"
            };

            _mockRepo.Setup(r => r.GetPolicyAsync(id))
                     .ReturnsAsync(existing);

            _mockRepo.Setup(r => r.UpdatePolicyAsync(existing))
                     .Returns(Task.CompletedTask);

            var result = await _service.UpdatePolicy(id, dto);

            Assert.NotNull(result);
            Assert.Equal(dto.Insurer, result!.Insurer);
            Assert.Equal(dto.PolicyType, result.PolicyType);
            Assert.Equal(dto.PremiumAmt, result.PremiumAmt);

            _mockRepo.Verify(r => r.UpdatePolicyAsync(existing), Times.Once);
        }

        // ------------------------------------------------------------
        //  UpdatePolicy_WhenNotFound_ReturnsNull (Negative)
        // ------------------------------------------------------------
        [Fact]
        public async Task UpdatePolicy_WhenNotFound_ReturnsNull()
        {
            long id = 999;

            _mockRepo.Setup(r => r.GetPolicyAsync(id))
                     .ReturnsAsync((Policy?)null);

            var dto = new PolicyUpdateDto();

            var result = await _service.UpdatePolicy(id, dto);

            Assert.Null(result);
            _mockRepo.Verify(r => r.UpdatePolicyAsync(It.IsAny<Policy>()), Times.Never);
        }

        // ------------------------------------------------------------
        //  DeletePolicy_DeletesSuccessfully (Positive)
        // ------------------------------------------------------------
        [Fact]
        public async Task DeletePolicy_DeletesSuccessfully()
        {
            long id = 50;
            var policy = new Policy { PolicyId = id };

            _mockRepo.Setup(r => r.GetPolicyAsync(id))
                     .ReturnsAsync(policy);

            _mockRepo.Setup(r => r.DeletePolicyAsync(id))
                     .Returns(Task.CompletedTask);

            await _service.DeletePolicy(id);

            _mockRepo.Verify(r => r.DeletePolicyAsync(id), Times.Once);
        }

        // ------------------------------------------------------------
        //  DeletePolicy_WhenNotFound_DoesNothing (Negative)
        // ------------------------------------------------------------
        [Fact]
        public async Task DeletePolicy_WhenNotFound_DoesNothing()
        {
            long id = 404;

            _mockRepo.Setup(r => r.GetPolicyAsync(id))
                     .ReturnsAsync((Policy?)null);

            await _service.DeletePolicy(id);

            _mockRepo.Verify(r => r.DeletePolicyAsync(It.IsAny<long>()), Times.Never);
        }
    }
}