namespace Arkim.Domain.Model.Equipment
{
	public class AssetDetails : AssetConfiguration
	{
		public string LocationId { get; set; }
		public string? Manufacturer { get; set; }
		public string? Model { get; set; }
		public string? SerialNumber { get; set; }
		public IEnumerable<SensorDetails>? Sensors { get; set; } = Enumerable.Empty<SensorDetails>();
	}
}
