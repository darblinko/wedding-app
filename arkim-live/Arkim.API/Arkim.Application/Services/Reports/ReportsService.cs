using Arkim.Application.Services.Equipment;
using Arkim.Application.Services.Readings;
using Arkim.Domain.Model.Reports.Filters;
using Arkim.Domain.Model.Reports.SensorReadingsBrowser;

namespace Arkim.Application.Services.Reports
{
	public class ReportsService : IReportsService
	{
		private readonly IReadingsStorage _readings;
		private readonly IEquipmentStorage _es;
		private readonly IContextProvider _contextProvider;

		public ReportsService(IReadingsStorage readings, IEquipmentStorage es, IContextProvider contextProvider)
		{
			_readings = readings;
			_es = es;
			_contextProvider = contextProvider;
		}

		public async Task<SensorReadingsBrowserConfiguration> GetSensorReadingsBrowserConfigurationAsync()
		{
			// TODO: Consider adding cache
			var result = new SensorReadingsBrowserConfiguration();
			var assets = await _es.ListCompanyAssetsAsync(_contextProvider.GetCompanyId());
			result.SensorFilters = assets
				.SelectMany(a => a.Sensors.Select(s => new SensorReadingsFilter
				{
					AssetId = a.Id,
					AssetName = a.Name,
					AssetDescription = a.Description ?? "",
					SensorId = s.Id,
					SensorType = s.Type ?? "",
					SensorDescription = s.Description ?? "",
				}));
			result.MetricTypes = await _readings.GetUniqueMetricTypesAsync(_contextProvider.GetCompanyId());
			return result;
		}

		public async Task<SensorReadingsBrowserReport> GetSensorReadingsBrowserReportAsync(SensorReadingsBrowserReportParameters parameters)
		{
			var companyId = _contextProvider.GetCompanyId();
			return await _readings.GetReadingsReportPageAsync(companyId, parameters);
		}
	}
}
