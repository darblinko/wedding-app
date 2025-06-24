using Amazon.Runtime;
using Arkim.Application.Services.Readings;
using Arkim.Domain.Model.Readings;
using Arkim.Domain.Model.Reports.SensorReadingsBrowser;
using Arkim.Infrastructure.Clients.Timestream;
using Arkim.Infrastructure.Model.Timestream;

namespace Arkim.Infrastructure.RepositoryServices
{
	public class ReadingsStorage : IReadingsStorage
	{
		private readonly ITimestreamClient _ts;

		public ReadingsStorage(ITimestreamClient ts)
		{
			_ts = ts;
		}

		public async Task<IEnumerable<SensorReading>> GetLatestReadingsAsync(string companyId, IEnumerable<string> assetIds)
		{
			if (assetIds == null || !assetIds.Any()) return Enumerable.Empty<SensorReading>();

			const string queryTemplate = @"
				 WITH ranked AS (
					 SELECT AssetId, measure_name, time, measure_value::double AS value,
							ROW_NUMBER() OVER (PARTITION BY AssetId, measure_name ORDER BY time DESC) AS rnk
					 FROM arkim.SensorReadings
					 WHERE CompanyId = @companyId
						AND AssetId IN (@assetIds)
				 )
				 SELECT 
 					AssetId as AssetId
					, measure_name as MetricName
					, time as TimeUtc
					, value as Value
				 FROM ranked
				 WHERE rnk = 1
			";

			return await _ts.ExecuteQueryCombinedAsync<SensorReading>(
				queryTemplate
				, "@companyId", companyId
				, "@assetIds", assetIds
			);
		}

		public async Task<IEnumerable<SensorReading>> GetRecentReadingsAsync(string companyId, IEnumerable<string> assetIds, string[] metrics, int timeWindowMin)
		{
			if (assetIds == null || !assetIds.Any()) return Enumerable.Empty<SensorReading>();

			const string queryTemplate = @"
				SELECT 
 					AssetId as AssetId
					, measure_name as MetricName
					, BIN(time, 6m) as TimeUtc
					, AVG(measure_value::double) AS Value
				FROM arkim.SensorReadings
				WHERE CompanyId = @companyId
					AND AssetId IN (@assetIds)
					AND measure_name IN (@metric)
					AND time > ago(@timeWindowMin)
				GROUP BY AssetId, measure_name, BIN(time, 6m)
			";

			return await _ts.ExecuteQueryCombinedAsync<SensorReading>(
				queryTemplate
				, "@companyId", companyId
				, "@assetIds", assetIds
				, "@metric", metrics
				, "@timeWindowMin", new TimeParameter(timeWindowMin, "m")
			);
		}

		public async Task<IEnumerable<string>> GetUniqueMetricTypesAsync(string companyId)
		{
			const string queryTemplate = @"
				SELECT distinct measure_name
				FROM arkim.SensorReadings 
				WHERE CompanyId = 'gym-bar'
					and time > ago(48h)
				ORDER BY measure_name
			";

			return await _ts.ExecuteQueryCombinedAsync<string>(
				queryTemplate
				, "@companyId", companyId
			);
		}

		public async Task<SensorReadingsBrowserReport> GetReadingsReportPageAsync(string companyId, SensorReadingsBrowserReportParameters parameters)
		{
			string queryTemplate = @"
				SELECT 
					CompanyId as CompanyId
 					, AssetId as AssetId
					, SensorId as SensorId
					, measure_name as MetricName
					, time as TimeUtc
					, measure_value::double AS Value
				FROM arkim.SensorReadings
				WHERE CompanyId = @companyId
					AND time > ago(48h)	
			";
			
			var queryParams = new Dictionary<string, object>();
			queryParams.Add("@companyId", companyId);

			// Handle on-demand filters
			if (parameters != null && parameters.AssetIds != null && parameters.AssetIds.Any())
			{
				queryTemplate += @"
					AND AssetId IN (@assetIds)
				";
				queryParams.Add("@assetIds", parameters.AssetIds);
			}
			if (parameters != null && parameters.SensorIds != null && parameters.SensorIds.Any())
			{
				queryTemplate += @"
					AND SensorId IN (@sensorIds)
				";
				queryParams.Add("@sensorIds", parameters.SensorIds);
			}
			if (parameters != null && parameters.MetricTypes != null && parameters.MetricTypes.Any())
			{
				queryTemplate += @"
					AND measure_name IN (@metricTypes)
				";
				queryParams.Add("@metricTypes", parameters.MetricTypes);
			}

			// Newest readings first
			queryTemplate += @"
				ORDER BY time desc
			";

			var result = await _ts.ExecuteQuerySinglePageAsync<SensorReading>(queryTemplate, 100, parameters.NextToken, queryParams);
			return new SensorReadingsBrowserReport
			{
				Rows = result.Data,
				NextToken = result.NextToken,
			};
		}
	}
}
