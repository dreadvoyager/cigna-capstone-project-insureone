using Xunit;
using Moq;
using InsuranceAPI.Controllers;
using InsuranceAPI.Services;
using InsurancePolicy = InsuranceAPI.Models.Policy; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;

public class PolicyControllerTests
{
    private readonly Mock<IPolicyService> _mockService;
    private readonly PolicyController _controller;

    public PolicyControllerTests()
    {
        _mockService = new Mock<IPolicyService>();
        _controller = new PolicyController(_mockService.Object);

        // Simulate authenticated user
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("id", "user123")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    [Fact]
    public async Task GetPolicies_ReturnsOkResult_WithPolicies()
    {
        // Arrange
        var policiesList = new List<InsurancePolicy>
        {
            new InsurancePolicy { PolicyId = 1, PolicyType = "Life Insurance" }
        };
        _mockService.Setup(s => s.GetPolicies("user123")).ReturnsAsync(policiesList);

        // Act
        var result = await _controller.GetPolicies();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsType<List<InsurancePolicy>>(okResult.Value);
        Assert.Single(returnValue);
        _mockService.Verify(s => s.GetPolicies("user123"), Times.Once);
    }

    [Fact]
    public async Task GetPolicy_ReturnsNotFound_WhenPolicyDoesNotExist()
    {
        // Arrange
        _mockService.Setup(s => s.GetPolicy(99)).ReturnsAsync((InsurancePolicy)null);

        // Act
        var result = await _controller.GetPolicy(99);

        // Assert
        Assert.IsType<NotFoundResult>(result);
        _mockService.Verify(s => s.GetPolicy(99), Times.Once);
    }

    [Fact]
    public async Task CreatePolicy_ReturnsOkResult()
    {
        // Arrange
        var policy = new InsurancePolicy { PolicyId = 1, PolicyType = "Health Insurance" };
        _mockService.Setup(s => s.AddPolicy(policy)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.CreatePolicy(policy);

        // Assert
        Assert.IsType<OkResult>(result);
        _mockService.Verify(s => s.AddPolicy(policy), Times.Once);
    }

    [Fact]
    public async Task UpdatePolicy_ReturnsOkResult()
    {
        // Arrange
        var policy = new InsurancePolicy { PolicyType = "Updated Policy" };
        _mockService.Setup(s => s.UpdatePolicy(It.IsAny<InsurancePolicy>())).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdatePolicy(1, policy);

        // Assert
        Assert.IsType<OkResult>(result);
        Assert.Equal(1, policy.PolicyId);
        _mockService.Verify(s => s.UpdatePolicy(policy), Times.Once);
    }

    
}
