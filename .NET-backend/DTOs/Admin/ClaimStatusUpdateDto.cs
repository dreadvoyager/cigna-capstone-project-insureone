namespace InsuranceAPI.DTOs.Admin
{
    public class ClaimStatusUpdateDto
    {
        public string Status { get; set; } = string.Empty; // "Approved", "Rejected", "UnderReview"
    }
}