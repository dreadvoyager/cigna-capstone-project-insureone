namespace InsuranceAPI.DTOs.Admin
{
    public class PolicyUpdateDto
    {
        public long PolicyId { get; set; }
        public string Insurer { get; set; } = string.Empty;
        public string PolicyType { get; set; } = string.Empty;
        public decimal PremiumAmt { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active";
    }
}