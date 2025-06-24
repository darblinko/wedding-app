using Amazon;
using Amazon.DynamoDBv2;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon.Runtime.Credentials;
using Amazon.TimestreamQuery;
using Arkim.Application.Services.ApiKey;
using Arkim.Application.Services.Authentication;
using Arkim.Application.Services.Company;
using Arkim.Application.Services.Equipment;
using Arkim.Application.Services.Location;
using Arkim.Application.Services.Readings;
using Arkim.Application.Services.User;
using Arkim.Infrastructure.Clients.DDB;
using Arkim.Infrastructure.Clients.Timestream;
using Arkim.Infrastructure.RepositoryServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Arkim.Infrastructure
{
	public static class InfrastructureRoot
	{
		public static void RegisterServices(IServiceCollection services, IConfiguration configuration)
		{
			RegisterAwsServices(services, configuration);

			// Clients
			services.AddSingleton<IDynamoClient, DynamoClient>();
			services.AddTransient<ITimestreamClient, TimestreamClient>();

			// Infrastructure services
			services.AddTransient<ICompanyStorage, CompanyStorage>();
			services.AddTransient<ILocationStorage, LocationStorage>();
			services.AddTransient<IUserStorage, UserStorage>();
			services.AddTransient<IEquipmentStorage, EquipmentStorage>();
			services.AddTransient<IApiKeyStorage, ApiKeyStorage>();
			services.AddTransient<IReadingsStorage, ReadingsStorage>();
			services.AddTransient<ISessionStorage, SessionStorage>();
		}

		private static void RegisterAwsServices(IServiceCollection services, IConfiguration configuration)
		{
			var awsSection = configuration.GetSection("AWS");
			AWSCredentials awsCredentials = null;
			if (awsSection != null && !string.IsNullOrWhiteSpace(awsSection["AccessKey"]) && !string.IsNullOrWhiteSpace(awsSection["Secret"]))
			{
				awsCredentials = new BasicAWSCredentials(awsSection["AccessKey"], awsSection["Secret"]);
			}
			else
			{
				awsCredentials = DefaultAWSCredentialsIdentityResolver.GetCredentials();
			}

            // Timestream is not available in US-West-1, so we use US-West-2 for all services for consistency
            services.AddDefaultAWSOptions(new AWSOptions
			{
				Credentials = awsCredentials,
				Region = RegionEndpoint.USWest2
			});

			// Add the services
			services.AddAWSService<IAmazonDynamoDB>();			
			services.AddAWSService<IAmazonTimestreamQuery>();
		}
	}
}
