using Arkim.Domain.Model.Location;

namespace Arkim.Domain.Model.Dashboard
{
	public class LocationOverview
	{
		public bool IsSuccess { get; set; } = true;
		public LocationDetails Location { get; set; }
		public IEnumerable<AssetStatus> Assets { get; set; } = Enumerable.Empty<AssetStatus>();
		public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
		public string? ErrorMessage { get; set; }
	}
}
