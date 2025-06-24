using Arkim.Application.Services.Reports;
using Arkim.Domain.Model.Reports.SensorReadingsBrowser;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession(RequireAdmin = false)]
	[ApiController]
	[Route("api/reports")]
	public class ReportsController : ControllerBase
	{
		private readonly IReportsService _reportsService;

		public ReportsController(IReportsService service)
		{
			_reportsService = service;
		}


		[HttpGet]
		[Route("readings/config")]
		public async Task<SensorReadingsBrowserConfiguration> GetSensorReadingsBrowserConfigurationAsync()
			=> await _reportsService.GetSensorReadingsBrowserConfigurationAsync();

		[HttpPost]
		[Route("readings")]
		public async Task<SensorReadingsBrowserReport> GetSensorReadingsBrowserReportAsync([FromBody] SensorReadingsBrowserReportParameters parameters)
			=> await _reportsService.GetSensorReadingsBrowserReportAsync(parameters);
	}
}
