namespace Arkim.Domain.Model.Equipment
{
	public class AssetConfiguration : AssetBase
	{
		public double MinOperatingTemperatureC { get; set; }
		public double MaxOperatingTemperatureC { get; set; }
		public double? MinOperatingHumidityPercent { get; set; }
		public double? MaxOperatingHumidityPercent { get; set; }
	}
}
