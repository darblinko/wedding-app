using Arkim.Domain.Model.Reports.Filters;

namespace Arkim.Domain.Model.Reports.SensorReadingsBrowser
{
	public class SensorReadingsBrowserConfiguration
	{
		public IEnumerable<SensorReadingsFilter> SensorFilters { get; set; }
		public IEnumerable<string> MetricTypes { get; set; }
	}
}
