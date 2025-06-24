using Arkim.WebAPI.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace Arkim.WebAPI
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var builder = WebApplication.CreateBuilder(args);

			// Standard Middlewares
			builder.Services.AddMemoryCache();
			builder.Services.AddHttpContextAccessor();          // Add services to the container.
			builder.Services.AddControllers().AddJsonOptions(options =>
			{
				options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
				options.JsonSerializerOptions.Converters.Remove(
					options.JsonSerializerOptions.Converters.FirstOrDefault(c => c is JsonStringEnumConverter)
				);
			}).ConfigureApiBehaviorOptions(options =>
			{
				options.InvalidModelStateResponseFactory = context =>
				{
					// TODO: Add logging here
					var errors = context.ModelState
						.Where(e => e.Value.Errors.Count > 0)
						.Select(e => new
						{
							PropertyName = e.Key,
							Errors = e.Value.Errors.Select(e => e.ErrorMessage).ToArray()
						});

					return new BadRequestObjectResult(new
					{
						Message = "Validation errors occurred",
						Errors = errors
					});
				};
			});
			builder.Services.AddEndpointsApiExplorer();
			builder.Services.AddOpenApi();
			builder.Services.AddSwaggerGen();

			// Add health checks for App Runner
			builder.Services.AddHealthChecks();


			// Custom services
			CompositionRoot.RegisterServices(builder);

			// This middleware is necessary to keep HTTPS when working under the load balancer
			// https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-6.0
			builder.Services.Configure<ForwardedHeadersOptions>(options =>
			{
				options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
				options.KnownNetworks.Clear();
				options.KnownProxies.Clear();
			});

			// TODO: Review if we want to use this in production
			builder.Services.AddCors(options =>
			{
				options.AddDefaultPolicy(policy =>
				{
					policy.AllowAnyOrigin()
						  .AllowAnyHeader()
						  .AllowAnyMethod();
				});
			});


			var app = builder.Build();

			app.UseForwardedHeaders();

			// Configure the HTTP request pipeline.
			if (app.Environment.IsDevelopment())
			{
				app.MapOpenApi();
				app.UseSwagger();
				app.UseSwaggerUI();
			}

			app.UseCors(builder => builder
				.AllowAnyOrigin()
				.AllowAnyMethod()
				.AllowAnyHeader());

			app.UseMiddleware<SessionAuthMiddleware>();
			app.UseHttpsRedirection();

			app.MapControllers();

			// Map the explicit health endpoint for App Runner
			// This will override the controller route if needed
			app.MapHealthChecks("/health");

			app.Run();
		}
	}
}
