using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UrbanPulse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSafetyStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentSafetyStatus",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SafetyStatusUpdatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentSafetyStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SafetyStatusUpdatedAt",
                table: "Users");
        }
    }
}
