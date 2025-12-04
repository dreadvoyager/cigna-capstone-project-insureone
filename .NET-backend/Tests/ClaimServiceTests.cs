using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using InsuranceAPI.Services;
using InsuranceAPI.Repositories;
using InsuranceAPI.Models;
using InsuranceAPI.DTOs;
using InsuranceAPI.DTOs.Admin;

namespace InsuranceAPI.Tests.Services
{
    public class ClaimServiceTests
    {
        private readonly Mock<IClaimRepository> _mockRepo;
        private readonly ClaimService _service;

        public ClaimServiceTests()
        {
            _mockRepo = new Mock<IClaimRepository>();
            _service = new ClaimService(_mockRepo.Object);
        }

        // -----------------------------------------------
        // 1. GetClaims (Positive)
        // -----------------------------------------------
        [Fact]
        public async Task GetClaims_ReturnsClaimsForUser()
        {
            var userId = "user123";
            var expected = new List<Claim>
            {
                new Claim { ClaimId = 1, UserId = userId },
                new Claim { ClaimId = 2, UserId = userId }
            };

            _mockRepo.Setup(r => r.GetClaimsByUserAsync(userId))
                     .ReturnsAsync(expected);

            var result = await _service.GetClaims(userId);

            Assert.Equal(expected, result);
            _mockRepo.Verify(r => r.GetClaimsByUserAsync(userId), Times.Once);
        }

        // -----------------------------------------------
        // 2. GetClaims (Negative - no claims)
        // -----------------------------------------------
        [Fact]
        public async Task GetClaims_ReturnsEmpty_WhenNoClaims()
        {
            var userId = "test";

            _mockRepo.Setup(r => r.GetClaimsByUserAsync(userId))
                     .ReturnsAsync(new List<Claim>());

            var result = await _service.GetClaims(userId);

            Assert.Empty(result);
        }

        // -----------------------------------------------
        // 3. GetClaim (Positive)
        // -----------------------------------------------
        [Fact]
        public async Task GetClaim_ReturnsCorrectClaim()
        {
            var claim = new Claim { ClaimId = 10 };

            _mockRepo.Setup(r => r.GetClaimAsync(10))
                     .ReturnsAsync(claim);

            var result = await _service.GetClaim(10);

            Assert.Equal(claim, result);
            _mockRepo.Verify(r => r.GetClaimAsync(10), Times.Once);
        }

        // -----------------------------------------------
        // 4. GetClaim (Negative - not found)
        // -----------------------------------------------
        [Fact]
        public async Task GetClaim_ReturnsNull_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetClaimAsync(77))
                     .ReturnsAsync((Claim?)null);

            var result = await _service.GetClaim(77);

            Assert.Null(result);
        }


        // -----------------------------------------------
        // 5. AddClaim (Positive)
        // -----------------------------------------------
        [Fact]
        public async Task AddClaim_CallsRepositoryOnce()
        {
            var claim = new Claim { ClaimId = 1, UserId = "user" };

            _mockRepo.Setup(r => r.AddClaimAsync(claim))
                     .Returns(Task.CompletedTask);

            await _service.AddClaim(claim);

            _mockRepo.Verify(r => r.AddClaimAsync(claim), Times.Once);
        }


        // -----------------------------------------------
        // 6. UpdateClaim (Positive)
        // -----------------------------------------------
        [Fact]
        public async Task UpdateClaim_UpdatesSuccessfully()
        {
            long id = 5;

            var existing = new Claim { ClaimId = id, Status = "Submitted" };
            var dto = new ClaimStatusUpdateDto { Status = "Approved" };

            _mockRepo.Setup(r => r.GetClaimAsync(id))
                     .ReturnsAsync(existing);

            _mockRepo.Setup(r => r.UpdateClaimAsync(existing))
                     .Returns(Task.CompletedTask);

            var result = await _service.UpdateClaimStatus(id, dto);

            Assert.NotNull(result);
            Assert.Equal("Approved", result.Status);

            _mockRepo.Verify(r => r.UpdateClaimAsync(existing), Times.Once);
        }

        // -----------------------------------------------
        // 7. UpdateClaim (Negative - not found)
        // -----------------------------------------------
        [Fact]
        public async Task UpdateClaim_WhenNotFound_ReturnsNull()
        {
            long id = 404;

            _mockRepo.Setup(r => r.GetClaimAsync(id))
                     .ReturnsAsync((Claim?)null);

            var result = await _service.UpdateClaimStatus(id, new ClaimStatusUpdateDto { Status = "Approved" });

            Assert.Null(result);
            _mockRepo.Verify(r => r.UpdateClaimAsync(It.IsAny<Claim>()), Times.Never);
        }


        // -----------------------------------------------
        // 8. DeleteClaim (Positive)
        // -----------------------------------------------
        [Fact]
        public async Task DeleteClaim_DeletesSuccessfully()
        {
            long id = 100;

            _mockRepo.Setup(r => r.DeleteClaimAsync(id))
                     .Returns(Task.CompletedTask);

            await _service.DeleteClaim(id);

            _mockRepo.Verify(r => r.DeleteClaimAsync(id), Times.Once);
        }

        // -----------------------------------------------
        // 9. DeleteClaim (Negative - repo will handle)
        // -----------------------------------------------
        [Fact]
        public async Task DeleteClaim_DoesNotThrow_WhenNotFound()
        {
            long id = 999;

            _mockRepo.Setup(r => r.DeleteClaimAsync(id))
                     .Returns(Task.CompletedTask);

            await _service.DeleteClaim(id);

            _mockRepo.Verify(r => r.DeleteClaimAsync(id), Times.Once);
        }
    }
}