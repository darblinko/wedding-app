using Arkim.Domain.Model.Reports.SensorReadingsBrowser;

namespace Arkim.Application.Services.Reports
{
	public interface IReportsService
	{
		Task<SensorReadingsBrowserConfiguration> GetSensorReadingsBrowserConfigurationAsync();
		Task<SensorReadingsBrowserReport> GetSensorReadingsBrowserReportAsync(SensorReadingsBrowserReportParameters parameters);
	}
}
