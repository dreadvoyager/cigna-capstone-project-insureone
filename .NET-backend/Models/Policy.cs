using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace InsuranceAPI.Models
{

    public class Policy
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long PolicyId { get; set; }

        [ForeignKey("User")]
        public string UserId { get; set; }

        public string Insurer { get; set; }

        public string PolicyType { get; set; }

        public decimal PremiumAmt { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Status { get; set; }

        [JsonIgnore]
        public ICollection<Claim>? Claims { get; set; }

        [JsonIgnore]
        public ApplicationUser? User { get; set; }  
    }

}
