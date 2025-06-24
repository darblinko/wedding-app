using Arkim.Domain.Model.Company;

namespace Arkim.Application.DTO.Equipment
{
	public class SensorAllocationRecordDto
	{
		public string SensorId { get; set; }
		public string AssetId { get; set; }
		public string AssetName { get; set; }
		public string CompanyId { get; set; }

		public SensorAllocationRecordDto()
		{

		}

		public SensorAllocationRecordDto(string sensorId, AssetRecordDto asset, CompanyDetails company)
		{
			SensorId = sensorId;
			AssetId = asset.Id;
			AssetName = asset.OriginalName;
			CompanyId = company.Id;
		}
	}
}
