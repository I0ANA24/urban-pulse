using Microsoft.EntityFrameworkCore;
using UrbanPulse.Core.Entities;

namespace UrbanPulse.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Rating> Ratings { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<SavedPost> SavedPosts { get; set; }
    public DbSet<UserReport> UserReports { get; set; }
    public DbSet<DuplicateSuspect> DuplicateSuspects { get; set; }
    public DbSet<GlobalMessage> GlobalMessages { get; set; }
    public DbSet<EventVerification> EventVerifications { get; set; }
    public DbSet<SevereMessage> SevereMessages { get; set; }
    public DbSet<EmergencySubtype> EmergencySubtypes { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).HasDefaultValue("User");
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.HasOne(e => e.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedByUserId);
        });
    }
}