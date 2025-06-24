using Arkim.Domain.Model.Readings;
using Arkim.Domain.Model.Reports.SensorReadingsBrowser;

namespace Arkim.Application.Services.Readings
{
	public interface IReadingsStorage
	{
		Task<IEnumerable<SensorReading>> GetLatestReadingsAsync(string companyId, IEnumerable<string> assetIds);
		Task<IEnumerable<SensorReading>> GetRecentReadingsAsync(string companyId, IEnumerable<string> assetId, string[] metrics, int timeWindowMin);
		Task<IEnumerable<string>> GetUniqueMetricTypesAsync(string companyId);
		Task<SensorReadingsBrowserReport> GetReadingsReportPageAsync(string companyId, SensorReadingsBrowserReportParameters parameters);
	}
}
