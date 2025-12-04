using Microsoft.AspNetCore.Identity;

namespace InsuranceAPI.Models { 

    public class ApplicationUser : IdentityUser
    {
  
        public string? FullName { get; set; }
        
    }
}
