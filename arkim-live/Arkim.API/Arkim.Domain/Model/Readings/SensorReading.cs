namespace Arkim.Domain.Model.Readings
{
	public class SensorReading
	{
		public string? CompanyId { get; set; }
		public string? AssetId { get; set; }
		public string? SensorId { get; set; }
		public string? MetricName { get; set; }
		public DateTime TimeUtc { get; set; }
		public double Value { get; set; }
	}
}
