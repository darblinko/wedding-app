using Arkim.Application.Services.Equipment;
using Arkim.Application.Services.Location;
using Arkim.Application.Services.Readings;
using Arkim.Domain.Model.Dashboard;
using Arkim.Domain.Model.Equipment;
using Arkim.Domain.Model.Readings;
using Microsoft.Extensions.Caching.Memory;

namespace Arkim.Application.Services.Dashboard
{
	public class DashboardService : IDashboardService
	{
		const int CACHE_LIFETIME_MIN = 3;

		private readonly ILocationService _locationService;
		private readonly IEquipmentService _equipmentService;
		private readonly IReadingsStorage _readingsStorage;
		private readonly IMemoryCache _cache;
		private readonly IContextProvider _context;

		public DashboardService(ILocationService locationService, IEquipmentService equipmentService, IReadingsStorage readingsStorage, IMemoryCache cache, IContextProvider context)
		{
			_locationService = locationService;
			_equipmentService = equipmentService;
			_readingsStorage = readingsStorage;
			_cache = cache;
			_context = context;
		}

		public async Task<LocationOverview> GetLocationOverviewAsync(string locationId)
		{
			try
			{
				var cacheKey = GetCacheKey(locationId);
				if (_cache.TryGetValue(cacheKey, out LocationOverview locationOverview))
				{
					return locationOverview;
				}

				var result = new LocationOverview();
				result.Location = await _locationService.GetLocationDetailsAsync(locationId);
				if (result.Location == null)
				{
					return result;
				}

				var assets = await _equipmentService.ListLocationAssetsAsync(locationId);
				if (assets == null || assets.Count() == 0)
				{
					result.Assets = new List<AssetStatus>();
					return result;
				}

				var companyId = _context.GetCompanyId();
				var assetIds = assets.Select(a => a.Id);
				var recentReadings = await _readingsStorage.GetRecentReadingsAsync(companyId, assetIds, [ReadingMetrics.Temperature, ReadingMetrics.Humidity], 120);
				var latestReadings = await _readingsStorage.GetLatestReadingsAsync(companyId, assetIds);

				result.Assets = assets.Select(a =>
				{
					var assetRecentReadings = recentReadings.Where(r => r.AssetId == a.Id);
					var assetLatestTempReading = latestReadings.FirstOrDefault(r => r.AssetId == a.Id && r.MetricName == ReadingMetrics.Temperature);
					var assetLatestHumidityReading = latestReadings.FirstOrDefault(r => r.AssetId == a.Id && r.MetricName == ReadingMetrics.Humidity);
					return new AssetStatus
					{
						Asset = a,
						LastRegisteredTempC = assetLatestTempReading?.Value,
						LastRegisteredTempTimeUtc = assetLatestTempReading?.TimeUtc,
						LastRegisteredHumidityPercent = assetLatestHumidityReading?.Value,
						LastRegisteredHumidityTimeUtc = assetLatestHumidityReading?.TimeUtc,
						RecentTemperatureReadings = assetRecentReadings
							.Where(r => r.MetricName == ReadingMetrics.Temperature)
							.ToDictionary(r => r.TimeUtc, r => r.Value),
						RecentHumidityReadings = assetRecentReadings
							.Where(r => r.MetricName == ReadingMetrics.Humidity)
							.ToDictionary(r => r.TimeUtc, r => r.Value),
						Issues = AnalyzeReadingsForIssues(assetRecentReadings, a)
							.ToDictionary(pair => (int)pair.Key, pair => pair.Value)
					};
				});

				_cache.Set(cacheKey, result, TimeSpan.FromMinutes(CACHE_LIFETIME_MIN));
				return result;

			}
			catch (Exception ex)
			{
				return new LocationOverview
				{
					IsSuccess = false,
					ErrorMessage = ex.Message,
				};
			}
		}

		private IDictionary<AssetIssueTypes, double?> AnalyzeReadingsForIssues(IEnumerable<SensorReading> recentReadings, AssetConfiguration asset)
		{
			var result = new Dictionary<AssetIssueTypes, double?>();
			bool noTemperatureReadings = true;
			bool noHumidityReadings = true;
			foreach (var reading in recentReadings)
			{
				if (reading.MetricName == ReadingMetrics.Temperature)
				{
					noTemperatureReadings = false;
					if (!result.ContainsKey(AssetIssueTypes.Temperature_Above) && reading.Value > asset.MaxOperatingTemperatureC)
					{
						result.Add(AssetIssueTypes.Temperature_Above, reading.Value);
					}
					else if (!result.ContainsKey(AssetIssueTypes.Temperature_Below) && reading.Value < asset.MinOperatingTemperatureC)
					{
						result.Add(AssetIssueTypes.Temperature_Below, reading.Value);
					}
				}
				else if (reading.MetricName == ReadingMetrics.Humidity)
				{
					noHumidityReadings = false;
					if (!result.ContainsKey(AssetIssueTypes.Humidity_Above) && asset.MaxOperatingHumidityPercent != null && reading.Value > asset.MaxOperatingHumidityPercent)
					{
						result.Add(AssetIssueTypes.Humidity_Above, reading.Value);
					}
					else if (!result.ContainsKey(AssetIssueTypes.Humidity_Below) && asset.MinOperatingHumidityPercent != null && reading.Value < asset.MinOperatingHumidityPercent)
					{
						result.Add(AssetIssueTypes.Humidity_Below, reading.Value);
					}
				}
			}
			if (noTemperatureReadings)
			{
				result.Add(AssetIssueTypes.Temperature_NotReceived, null);
			}
			if (noHumidityReadings)
			{
				result.Add(AssetIssueTypes.Humidity_NotReceived, null);
			}
			return result;
		}

		private string GetCacheKey(string locationId)
		{
			return $"dashboard.{locationId}";
		}
	}
}
