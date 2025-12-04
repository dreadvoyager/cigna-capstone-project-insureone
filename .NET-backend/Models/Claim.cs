using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace InsuranceAPI.Models
{

    public class Claim
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long ClaimId { get; set; }

        [ForeignKey("Policy")]
        public long PolicyId { get; set; }

        [ForeignKey("User")]
        public string UserId { get; set; } 

        public decimal ClaimAmt { get; set; }

        public string Description { get; set; }

        public string Status { get; set; }

        public DateTime SubmittedAt { get; set; }

        [JsonIgnore]
        public ApplicationUser? User { get; set; }

        [JsonIgnore]
        public Policy? Policy {  get; set; }
    }

}
