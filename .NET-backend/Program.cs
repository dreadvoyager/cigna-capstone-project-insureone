using System.Configuration;
using System.Text;
using InsuranceAPI.Data;
using InsuranceAPI.Models;
using InsuranceAPI.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using InsuranceAPI.Repositories;
using InsuranceAPI.Services;

namespace InsuranceAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();

            builder.Services.AddDbContext<AppDbContext>(options => options.UseOracle(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddTransient<IPolicyService, PolicyService>();
            builder.Services.AddTransient<IPolicyRepository, PolicyRepository>();
            builder.Services.AddTransient<IClaimService, ClaimService>();
            builder.Services.AddTransient<IClaimRepository, ClaimRepository>();




            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            // Identity
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequiredLength = 8;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

            // JWT
            var jwtSection = builder.Configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSection["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSection["Audience"],
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });

            builder.Services.AddAuthorization();

            builder.Services.AddTransient<JwtTokenService>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });



            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseCors("AllowFrontend");


            // Ensure DB & seed roles and admin user
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var db = services.GetRequiredService<AppDbContext>();
                var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

                // Apply migrations
                try { db.Database.Migrate(); }
                catch (Exception ex) { Console.WriteLine("Migration error: " + ex.Message); }

                // Required roles
                var roles = new[] { "Admin", "Client" };

                foreach (var role in roles)
                {
                    if (!roleManager.RoleExistsAsync(role).Result)
                    {
                        roleManager.CreateAsync(new IdentityRole(role)).Wait();
                    }
                }

                // Seed Admin User
                var adminEmail = builder.Configuration["AdminUser:Email"] ?? "admin@insureone.com";
                var adminPassword = builder.Configuration["AdminUser:Password"] ?? "Admin@12345";

                var adminUser = userManager.FindByEmailAsync(adminEmail).Result;

                if (adminUser == null)
                {
                    adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        FullName = "System Administrator"
                    };

                    var result = userManager.CreateAsync(adminUser, adminPassword).Result;

                    if (result.Succeeded)
                    {
                        userManager.AddToRoleAsync(adminUser, "Admin").Wait();
                        Console.WriteLine(" Admin user created successfully");
                    }
                    else
                    {
                        Console.WriteLine("Failed to create admin user:");
                        foreach (var e in result.Errors)
                            Console.WriteLine("   - " + e.Description);
                    }
                }
                else
                {
                    if (!userManager.IsInRoleAsync(adminUser, "Admin").Result)
                    {
                        userManager.AddToRoleAsync(adminUser, "Admin").Wait();
                    }
                }
            }

            app.UseMiddleware<InsuranceAPI.Middlewares.CustomExceptionMiddleware>();
            app.MapControllers();
            app.Run();
        }
    }
}
