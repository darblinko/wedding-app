using Arkim.Application.DTO.Equipment;
using Arkim.Application.Services.Equipment;
using Arkim.Domain.Model.Equipment;
using Arkim.Infrastructure.Clients.DDB;

namespace Arkim.Infrastructure.RepositoryServices
{
	public class EquipmentStorage : IEquipmentStorage
	{
		private const string ASSETS_TABLE_NAME = "Assets";
		private const string ALLOCATIONS_TABLE_NAME = "SensorsAllocation";

		private readonly IDynamoClient _ddb;

		public EquipmentStorage(IDynamoClient ddb)
		{
			_ddb = ddb;
		}

		public async Task<IEnumerable<AssetDetails>> ListCompanyAssetsAsync(string companyId)
			=> await _ddb.GetItemsAsync<AssetDetails>(ASSETS_TABLE_NAME, companyId);

		public async Task<AssetRecordDto> GetAssetDetailsAsync(string companyId, string assetId)
			=> await _ddb.GetItemAsync<AssetRecordDto>(ASSETS_TABLE_NAME, companyId, assetId);

		public async Task UpsertAssetAsync(AssetRecordDto asset)
			=> await _ddb.PutItemAsync(ASSETS_TABLE_NAME, asset);

		public async Task DeleteAssetAsync(string companyId, string assetId)
			=> await _ddb.DeleteItemAsync(ASSETS_TABLE_NAME, assetId);

		public async Task AddSensorAllocation(SensorAllocationRecordDto allocationRecord)
			=> await _ddb.PutItemAsync(ALLOCATIONS_TABLE_NAME, allocationRecord);

		public async Task<SensorAllocationRecordDto> GetSensorAllocation(string sensorId)
			=> await _ddb.GetItemAsync<SensorAllocationRecordDto>(ALLOCATIONS_TABLE_NAME, sensorId);

		public async Task RemoveSensorAllocation(string sensorId)
			=> await _ddb.DeleteItemAsync(ALLOCATIONS_TABLE_NAME, sensorId);
	}
}
