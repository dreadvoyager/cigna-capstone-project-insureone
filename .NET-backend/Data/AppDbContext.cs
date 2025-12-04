using InsuranceAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace InsuranceAPI.Data
{

    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<Policy> Policies { get; set; }

        public DbSet<Claim> Claims { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User -> Policies (1:N)
            modelBuilder.Entity<Policy>()
                .HasOne(p => p.User) 
                .WithMany() 
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Policy -> Claims (1:N)
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Policy)
                .WithMany(p => p.Claims)
                .HasForeignKey(c => c.PolicyId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> Claims (1:N)
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // TABLE name => UPPERCASE
                entity.SetTableName(entity.GetTableName().ToUpper());

                // COLUMN names => UPPERCASE
                foreach (var prop in entity.GetProperties())
                {
                    var tableName = entity.GetTableName();
                    var columnName =
                    prop.GetColumnName(StoreObjectIdentifier.Table(tableName, entity.GetSchema()));
                    prop.SetColumnName(columnName.ToUpper());

                    if (prop.ClrType == typeof(bool) || prop.ClrType == typeof(bool?))
                    {
                        prop.SetColumnType("NUMBER(1)");
                    }


                }
                modelBuilder.Entity<IdentityRole>(entity =>
                {
                    entity.Property(e => e.ConcurrencyStamp).HasColumnType("NVARCHAR2(2000)");
                });

                modelBuilder.Entity<ApplicationUser>(entity =>
                {
                    entity.Property(e => e.ConcurrencyStamp).HasColumnType("NVARCHAR2(2000)");
                    entity.Property(e => e.SecurityStamp).HasColumnType("NVARCHAR2(2000)");
                    entity.Property(e => e.PasswordHash).HasColumnType("NVARCHAR2(2000)");
                });
            }

        }

    }
}
