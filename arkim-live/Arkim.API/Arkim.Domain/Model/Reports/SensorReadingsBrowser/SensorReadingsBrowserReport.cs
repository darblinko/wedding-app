using Arkim.Domain.Model.Readings;

namespace Arkim.Domain.Model.Reports.SensorReadingsBrowser
{
	public class SensorReadingsBrowserReport
	{
		public IEnumerable<SensorReading> Rows { get; set; }
		public string NextToken { get; set; }
	}
}
