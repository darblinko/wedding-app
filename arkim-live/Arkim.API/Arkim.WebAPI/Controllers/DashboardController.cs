using Arkim.Application.Services.Dashboard;
using Arkim.Domain.Model.Dashboard;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession(RequireAdmin = false)]
	[ApiController]
	[Route("api/dashboard")]
	public class DashboardController : ControllerBase
	{
		private readonly IDashboardService _dashboardService;

		public DashboardController(IDashboardService service)
		{
			_dashboardService = service;
		}


		[HttpGet]
		[Route("location")]
		public async Task<LocationOverview> GetLocationOverviewAsync([FromQuery] string locationId)
			=> await _dashboardService.GetLocationOverviewAsync(locationId);

	}
}
