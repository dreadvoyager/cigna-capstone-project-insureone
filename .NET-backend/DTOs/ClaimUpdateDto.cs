namespace InsuranceAPI.DTOs
{
    public class ClaimUpdateDto
    {
        public decimal ClaimAmt { get; set; }
        public string Description { get; set; }
        public string? Status {get; set; }
    }

}
