
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using InsuranceAPI.Controllers;
using InsuranceAPI.Models;
using InsuranceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using InsuranceClaim = InsuranceAPI.Models.Claim; 

public class ClaimControllerTests
{
    private readonly Mock<IClaimService> _mockClaimService;
    //private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
    private readonly ClaimController _controller;

    public ClaimControllerTests()
    {
        _mockClaimService = new Mock<IClaimService>();


        // Mock UserManager<ApplicationUser>
        //var store = new Mock<IUserStore<ApplicationUser>>();
        //_mockUserManager = new Mock<UserManager<ApplicationUser>>(
        //    store.Object, null, null, null, null, null, null, null, null
        //);
        // , _mockUserManager.Object
        _controller = new ClaimController(_mockClaimService.Object);

        // Mock User Identity using System.Security.Claims.Claim
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new System.Security.Claims.Claim("id", "test-user-id")
        }, "mock"));
        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    [Fact]
    public async Task GetClaims_ReturnsOkResult_WithClaims()
    {
        // Arrange
        var claimsList = new List<InsuranceClaim>
        {
            new InsuranceClaim { ClaimId = 1, UserId = "test-user-id", ClaimAmt = 1000 }
        };
        _mockClaimService.Setup(s => s.GetClaims("test-user-id"))
                         .ReturnsAsync(claimsList);

        // Act
        var result = await _controller.GetClaims();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsType<List<InsuranceClaim>>(okResult.Value);
        Assert.Single(returnValue);
    }

    [Fact]
    public async Task GetClaim_ReturnsNotFound_WhenClaimDoesNotExist()
    {
        // Arrange
        _mockClaimService.Setup(s => s.GetClaim(It.IsAny<long>()))
                         .ReturnsAsync((InsuranceClaim)null);

        // Act
        var result = await _controller.GetClaim(99);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task CreateClaim_ReturnsOkResult()
    {
        // Arrange
        var claim = new InsuranceClaim { ClaimId = 1, UserId = "test-user-id", ClaimAmt = 500 };
        _mockClaimService.Setup(s => s.AddClaim(claim)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.CreateClaim(claim);

        // Assert
        Assert.IsType<OkResult>(result);
        _mockClaimService.Verify(s => s.AddClaim(claim), Times.Once);
    }

    [Fact]
    public async Task UpdateClaim_ReturnsOkResult()
    {
        // Arrange
        var claim = new InsuranceClaim { ClaimId = 1, UserId = "test-user-id", ClaimAmt = 500 };
        _mockClaimService.Setup(s => s.UpdateClaim(claim)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateClaim(1, claim);

        // Assert
        Assert.IsType<OkResult>(result);
        Assert.Equal(1, claim.ClaimId);
        _mockClaimService.Verify(s => s.UpdateClaim(claim), Times.Once);
    }

    [Fact]
    public async Task DeleteClaim_ReturnsOkResult()
    {
        // Arrange
        _mockClaimService.Setup(s => s.DeleteClaim(1)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteClaim(1);

        // Assert
        Assert.IsType<OkResult>(result);
        _mockClaimService.Verify(s => s.DeleteClaim(1), Times.Once);
    }
}
