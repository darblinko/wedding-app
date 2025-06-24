using Arkim.Application.DTO.Equipment;
using Arkim.Domain.Model.Equipment;

namespace Arkim.Application.Services.Equipment
{
	public interface IEquipmentStorage
	{
		Task<IEnumerable<AssetDetails>> ListCompanyAssetsAsync(string companyId);
		Task<AssetRecordDto> GetAssetDetailsAsync(string companyId, string assetId);
		Task UpsertAssetAsync(AssetRecordDto asset);
		Task DeleteAssetAsync(string companyId, string assetId);
		Task AddSensorAllocation(SensorAllocationRecordDto allocationRecord);
		Task<SensorAllocationRecordDto> GetSensorAllocation(string sensorId);
		Task RemoveSensorAllocation(string sensorId);
	}
}
