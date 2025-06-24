using Arkim.Application.DTO.Location;
using Arkim.Domain.Model.Location;

namespace Arkim.Application.Services.Location
{
	public interface ILocationStorage
	{
		Task<IEnumerable<LocationBase>> ListCompanyLocationsAsync(string companyId);
		Task<LocationRecordDto> GetLocationDetailsAsync(string companyId, string locationId);
		Task UpsertLocationAsync(LocationRecordDto location);
		Task DeleteLocationAsync(string companyId, string locationId);
	}
}
