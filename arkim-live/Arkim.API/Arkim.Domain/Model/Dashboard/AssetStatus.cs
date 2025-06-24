using Arkim.Domain.Model.Equipment;

namespace Arkim.Domain.Model.Dashboard
{
	public class AssetStatus
	{
		public AssetConfiguration Asset { get; set; }
		public double? LastRegisteredTempC { get; set; }
		public DateTime? LastRegisteredTempTimeUtc { get; set; }
		public double? LastRegisteredHumidityPercent { get; set; }
		public DateTime? LastRegisteredHumidityTimeUtc { get; set; }
		public Dictionary<DateTime, double> RecentTemperatureReadings { get; set; }
		public Dictionary<DateTime, double> RecentHumidityReadings { get; set; }
		public IDictionary<int, double?> Issues { get; set; }
	}
}
