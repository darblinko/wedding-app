using Arkim.Application.Model;
using Arkim.Domain.Model.Equipment;

namespace Arkim.Application.Services.Equipment
{
	public interface IEquipmentService
	{
		Task<IEnumerable<AssetBase>> ListAssetsAsync(string search);
		Task<IEnumerable<AssetConfiguration>> ListLocationAssetsAsync(string locationId);
		Task<AssetDetails> GetAssetDetailsAsync(string assetId);
		Task<OperationResult> CreateAssetAsync(AssetDetails asset);
		Task<OperationResult> UpdateAssetAsync(AssetDetails asset);
		Task<OperationResult> DeleteAssetAsync(string assetId);
	}
}
