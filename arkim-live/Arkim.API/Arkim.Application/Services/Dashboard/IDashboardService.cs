using Arkim.Domain.Model.Dashboard;

namespace Arkim.Application.Services.Dashboard
{
	public interface IDashboardService
	{
		Task<LocationOverview> GetLocationOverviewAsync(string locationId);
	}
}
