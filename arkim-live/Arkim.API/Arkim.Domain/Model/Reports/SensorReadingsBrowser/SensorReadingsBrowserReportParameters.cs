namespace Arkim.Domain.Model.Reports.SensorReadingsBrowser
{
	public class SensorReadingsBrowserReportParameters
	{
		public IEnumerable<string>? AssetIds { get; set; }
		public IEnumerable<string>? SensorIds { get; set; }
		public IEnumerable<string>? MetricTypes { get; set; }
		public string? NextToken { get; set; }
	}
}
