using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UrbanPulse.API.Hubs;
using UrbanPulse.Core.Interfaces;
using UrbanPulse.Core.Services;
using UrbanPulse.Infrastructure.Data;
using UrbanPulse.Infrastructure.Repositories;

namespace UrbanPulse_Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            DotNetEnv.Env.Load();

            var builder = WebApplication.CreateBuilder(args);

            var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING")
                ?? builder.Configuration.GetConnectionString("Default");

            // Controllers
            builder.Services.AddControllers();
            builder.Services.AddProblemDetails();

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            // DB
            builder.Services.AddDbContext<AppDbContext>(opt =>
                opt.UseNpgsql(connectionString));

            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IEventRepository, EventRepository>();
            builder.Services.AddScoped<IEventService, EventService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ILikeRepository, LikeRepository>();
            builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
            builder.Services.AddScoped<IRatingRepository, RatingRepository>();
            builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
            builder.Services.AddScoped<IReportRepository, ReportRepository>();
            builder.Services.AddScoped<ISavedPostRepository, SavedPostRepository>();
            builder.Services.AddScoped<IUserReportRepository, UserReportRepository>();
            builder.Services.AddScoped<IAdminStatsRepository, AdminStatsRepository>();
            builder.Services.AddScoped<IDuplicateSuspectRepository, DuplicateSuspectRepository>();
            builder.Services.AddScoped<IDuplicateDetectionService, DuplicateDetectionService>();


            // SignalR
            builder.Services.AddSignalR();

            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Bearer {token}"
                });

                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // JWT
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_KEY");
            if (string.IsNullOrWhiteSpace(jwtSecret))
            {
                throw new InvalidOperationException("JWT_KEY environment variable is missing.");
            }

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtSecret))
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            builder.Services.AddAuthorization();

            var app = builder.Build();

            app.UseExceptionHandler(errorApp =>
            {
                errorApp.Run(async context =>
                {
                    var feature = context.Features.Get<IExceptionHandlerFeature>();
                    var exception = feature?.Error;

                    var (statusCode, title) = MapException(exception);

                    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                    if (exception is not null)
                    {
                        if (statusCode >= StatusCodes.Status500InternalServerError)
                        {
                            logger.LogError(exception, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
                        }
                        else
                        {
                            logger.LogWarning(exception, "Handled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
                        }
                    }

                    context.Response.StatusCode = statusCode;
                    context.Response.ContentType = "application/problem+json";

                    var problem = new ProblemDetails
                    {
                        Status = statusCode,
                        Title = title,
                        Detail = app.Environment.IsDevelopment()
                            ? exception?.Message
                            : "Please try again later.",
                        Instance = context.Request.Path
                    };
                    problem.Extensions["traceId"] = context.TraceIdentifier;

                    await context.Response.WriteAsJsonAsync(problem);
                });
            });

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            //app.UseHttpsRedirection();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.UseStaticFiles();
            app.MapHub<EventHub>("/hubs/events");
            app.MapHub<NotificationHub>("/hubs/notifications");
            app.MapHub<GlobalChatHub>("/hubs/global-chat");
            app.MapHub<SevereChatHub>("/hubs/severe-chat");

            app.Run();
        }

        private static (int statusCode, string title) MapException(Exception? exception)
        {
            return exception switch
            {
                ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request."),
                FormatException => (StatusCodes.Status400BadRequest, "Invalid request format."),
                UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Access denied."),
                KeyNotFoundException => (StatusCodes.Status404NotFound, "Resource not found."),
                InvalidOperationException => (StatusCodes.Status409Conflict, "Operation cannot be completed."),
                _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred."),
            };
        }
    }
}