using Arkim.Application.DTO.Location;
using Arkim.Application.Model;
using Arkim.Domain.Model.Location;

namespace Arkim.Application.Services.Location
{
	public interface ILocationService
	{
		Task<IEnumerable<LocationBase>> ListLocationsAsync(string search);
		Task<IEnumerable<LocationBase>> ListCurrentUserLocationsAsync();
		Task<LocationDetails> GetLocationDetailsAsync(string locationId);
		Task<OperationResult> CreateLocationAsync(LocationDetails location);
		Task<OperationResult> CreateLocationAsync(LocationRecordDto location);
		Task<OperationResult> UpdateLocationAsync(LocationDetails location);
		Task<OperationResult> DeleteLocationAsync(string locationId);
	}
}
