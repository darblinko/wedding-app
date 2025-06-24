using Arkim.Application.DTO.Location;
using Arkim.Application.Model;
using Arkim.Application.Utils;
using Arkim.Domain.Model.Location;

namespace Arkim.Application.Services.Location
{
	public class LocationService : ILocationService
	{
		private readonly ILocationStorage _storage;
		private readonly IContextProvider _context;

		public LocationService(ILocationStorage storage, IContextProvider context)
		{
			_storage = storage;
			_context = context;
		}

		public async Task<IEnumerable<LocationBase>> ListLocationsAsync(string search)
		{
			var locations = await _storage.ListCompanyLocationsAsync(_context.GetCompanyId());
			return locations.Where(l =>
				string.IsNullOrWhiteSpace(search) ||
				(l.Name?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
				(l.Description?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
			);
		}

		public async Task<IEnumerable<LocationBase>> ListCurrentUserLocationsAsync()
		{
			var locations = await _storage.ListCompanyLocationsAsync(_context.GetCompanyId());
			var isAdmin = _context.GetSession().IsAdmin;
			return locations.Where(l => isAdmin || (_context.GetSession().User.AssignedLocations?.Contains(l.Id) ?? false));
		}

		public async Task<LocationDetails> GetLocationDetailsAsync(string locationId)
		{
			var locationDetails = await _storage.GetLocationDetailsAsync(_context.GetCompanyId(), locationId);
			if (locationDetails == null)
			{
				return null;
			}

			return TypeUtils.CloneWithCast<LocationDetails>(locationDetails);
		}

		public async Task<OperationResult> CreateLocationAsync(LocationDetails location)
		{
			var locationRecord = TypeUtils.CloneWithCast<LocationRecordDto>(location);
			locationRecord.Id = Guid.CreateVersion7().ToString();
			locationRecord.CompanyId = _context.GetCompanyId();
			return await CreateLocationAsync(locationRecord);
		}

		public async Task<OperationResult> CreateLocationAsync(LocationRecordDto locationRecord)
		{
			try
			{
				await _storage.UpsertLocationAsync(locationRecord);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> UpdateLocationAsync(LocationDetails location)
		{
			var locationDetails = await _storage.GetLocationDetailsAsync(_context.GetCompanyId(), location.Id);
			if (locationDetails == null)
			{
				return new OperationResult(OperationStatus.NotFound, "location");
			}

			try
			{
				locationDetails.Email = location.Email;
				locationDetails.Name = location.Name;
				locationDetails.Description = location.Description;
				locationDetails.UseMetricSystem = location.UseMetricSystem;
				await _storage.UpsertLocationAsync(locationDetails);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> DeleteLocationAsync(string locationId)
		{
			var companyId = _context.GetCompanyId();
			var locationDetails = await _storage.GetLocationDetailsAsync(companyId, locationId);
			if (locationDetails == null)
			{
				return new OperationResult(OperationStatus.NotFound, "location");
			}

			try
			{
				await _storage.DeleteLocationAsync(companyId, locationId);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}
	}
}
