using Arkim.Application.DTO.Equipment;
using Arkim.Application.Model;
using Arkim.Application.Services.Company;
using Arkim.Application.Utils;
using Arkim.Domain.Model.Company;
using Arkim.Domain.Model.Equipment;

namespace Arkim.Application.Services.Equipment
{
	public class EquipmentService : IEquipmentService
	{
		private readonly IEquipmentStorage _storage;
		private readonly ICompanyStorage _company;
		private readonly IContextProvider _context;

		public EquipmentService(IEquipmentStorage storage, ICompanyStorage company, IContextProvider context)
		{
			_storage = storage;
			_company = company;
			_context = context;
		}

		public async Task<IEnumerable<AssetBase>> ListAssetsAsync(string search)
		{
			var companyId = _context.GetCompanyId();
			var assets = await _storage.ListCompanyAssetsAsync(companyId);
			assets = assets.Where(a =>
				string.IsNullOrWhiteSpace(search) ||
				(a.Name?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
				(a.Description?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
			);
			return TypeUtils.CloneWithCast<IEnumerable<AssetBase>>(assets);
		}

		public async Task<IEnumerable<AssetConfiguration>> ListLocationAssetsAsync(string locationId)
		{
			var companyId = _context.GetCompanyId();
			var assets = await _storage.ListCompanyAssetsAsync(companyId);
			assets = assets.Where(a => a.LocationId == locationId);
			return TypeUtils.CloneWithCast<IEnumerable<AssetConfiguration>>(assets);
		}

		public async Task<AssetDetails> GetAssetDetailsAsync(string assetId)
		{
			var companyId = _context.GetCompanyId();
			var assetDetails = await _storage.GetAssetDetailsAsync(companyId, assetId);
			if (assetDetails == null)
			{
				return null;
			}

			return TypeUtils.CloneWithCast<AssetDetails>(assetDetails);
		}

		public async Task<OperationResult> CreateAssetAsync(AssetDetails asset)
		{
			var assetRecord = TypeUtils.CloneWithCast<AssetRecordDto>(asset);
			var company = await _company.GetCompanyAsync(_context.GetCompanyId());
			assetRecord.Id = Guid.CreateVersion7().ToString();
			assetRecord.CompanyId = company.Id;
			assetRecord.OriginalName = assetRecord.Name;

			// Validate the sensors allocation
			var sensorsValidation = await	ValidateSensorsAllocation(assetRecord.CompanyId, asset.Id, asset.Sensors);
			if (!sensorsValidation.IsSuccess)
			{
				return sensorsValidation;
			}

			try
			{
				// First we add the asset
				await _storage.UpsertAssetAsync(assetRecord);

				// Then we add the sensor allocations
				if (asset.Sensors != null && asset.Sensors.Count() > 0)
				{
					foreach (var sensor in asset.Sensors)
					{
						await _storage.AddSensorAllocation(new SensorAllocationRecordDto(sensor.Id, assetRecord, company));
					}
				}
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> UpdateAssetAsync(AssetDetails asset)
		{
			var company = await _company.GetCompanyAsync(_context.GetCompanyId());
			var existingAsset = await _storage.GetAssetDetailsAsync(company.Id, asset.Id);
			if (existingAsset == null)
			{
				return new OperationResult(OperationStatus.NotFound, "Asset not found");
			}

			// Validate the sensors allocation
			var sensorsValidation = await ValidateSensorsAllocation(company.Id, asset.Id, asset.Sensors);
			if (!sensorsValidation.IsSuccess)
			{
				return sensorsValidation;
			}

			try
			{
				// First update the sensor allocations.
				// Remove the missing in the new details and add the new ones
				var res = await UpdateSensorAllocations(company, existingAsset, asset.Sensors);
				if (!res.IsSuccess)
				{
					return res;
				}

				// Then update the asset details
				var assetRecord = TypeUtils.CloneWithCast<AssetRecordDto>(asset);
				assetRecord.CompanyId = company.Id;
				assetRecord.OriginalName = existingAsset.OriginalName;
				await _storage.UpsertAssetAsync(assetRecord);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> DeleteAssetAsync(string assetId)
		{
			var companyId = _context.GetCompanyId();
			var assetDetails = await _storage.GetAssetDetailsAsync(companyId, assetId);
			if (assetDetails == null)
			{
				return new OperationResult(OperationStatus.NotFound, "Asset not found");
			}

			try
			{
				// First remove all sensor allocations
				if (assetDetails.Sensors != null && assetDetails.Sensors.Count() > 0)
				{
					foreach (var sensor in assetDetails.Sensors)
					{
						await _storage.RemoveSensorAllocation(sensor.Id);
					}
				}
				// Then delete the asset
				await _storage.DeleteAssetAsync(companyId, assetId);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		private async Task<OperationResult> UpdateSensorAllocations(CompanyDetails company, AssetRecordDto existingAsset, IEnumerable<SensorDetails> newSensors)
		{
			var existingSensors = existingAsset.Sensors;
			var sensorsToRemove = new List<string>();
			if (existingSensors != null && existingSensors.Count() > 0)
			{
				if (newSensors == null || existingSensors.Count() == 0)
				{
					sensorsToRemove = existingSensors.Select(s => s.Id).ToList();
				}
				else
				{
					sensorsToRemove = existingSensors
						.Where(es => !newSensors.Any(ns => ns.Id == es.Id))
						.Select(s => s.Id)
						.ToList();
				}
			}

			var sensorsToAdd = new List<string>();
			if (newSensors != null && newSensors.Count() > 0)
			{
				if (existingSensors == null || existingSensors.Count() == 0)
				{
					sensorsToAdd = newSensors.Select(s => s.Id).ToList();
				}
				else
				{
					sensorsToAdd = newSensors
						.Where(ns => !existingSensors.Any(es => es.Id == ns.Id))
						.Select(s => s.Id)
						.ToList();
				}
			}

			try
			{
				foreach (var sensorId in sensorsToRemove)
				{
					await _storage.RemoveSensorAllocation(sensorId);
				}
				foreach (var sensorId in sensorsToAdd)
				{
					await _storage.AddSensorAllocation(new SensorAllocationRecordDto(sensorId, existingAsset, company));
				}
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		private async Task<OperationResult> ValidateSensorsAllocation(string companyId, string assetId, IEnumerable<SensorDetails> sensors)
		{
			if (sensors == null || sensors.Count() == 0)
			{
				return new OperationResult();
			}

			// We need to make sure that the sensors are not already allocated to another asset
			foreach (var sensor in sensors)
			{
				var allocation = await _storage.GetSensorAllocation(sensor.Id);
				if (allocation != null && allocation.AssetId != assetId)
				{
					// Make sure the asset still exists, delete allocation otherwise
					var assetDetails = await _storage.GetAssetDetailsAsync(companyId, allocation.AssetId);
					if (assetDetails == null)
					{
						await _storage.RemoveSensorAllocation(sensor.Id);
						continue;
					}

					// Show different error if the sensor is allocated to another company
					if (allocation.CompanyId != companyId)
					{
						return new OperationResult(OperationStatus.BadRequest, $"Sensor {sensor.Id} is already allocated to another company, please contact the support in order to assist with allocaiton!");
					}
					else
					{
						return new OperationResult(OperationStatus.BadRequest, $"Sensor {sensor.Id} is already allocated to ${assetDetails.Name}, please remove the allocation before proceeding!");
					}
				}
			}
			return new OperationResult();
		}
	}
}
