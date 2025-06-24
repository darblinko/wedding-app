using Arkim.Application.Services.ApiKey;
using Arkim.Application.Services.Authentication;
using Arkim.Application.Services.Company;
using Arkim.Application.Services.Dashboard;
using Arkim.Application.Services.Equipment;
using Arkim.Application.Services.Location;
using Arkim.Application.Services.Reports;
using Arkim.Application.Services.User;
using Microsoft.Extensions.DependencyInjection;

namespace Arkim.Application
{
	public static class ApplicationRoot
	{
		public static void RegisterServices(IServiceCollection services)
		{
			services.AddTransient<ISessionService, SessionService>();
			services.AddTransient<IAuthService, AuthService>();
			services.AddTransient<ICompanyService, CompanyService>();
			services.AddTransient<ILocationService, LocationService>();
			services.AddTransient<IUserService, UserService>();
			services.AddTransient<IEquipmentService, EquipmentService>();
			services.AddTransient<IApiKeyService, ApiKeyService>();
			services.AddSingleton<IDashboardService, DashboardService>();
			services.AddTransient<IReportsService, ReportsService>();
		}
	}
}
