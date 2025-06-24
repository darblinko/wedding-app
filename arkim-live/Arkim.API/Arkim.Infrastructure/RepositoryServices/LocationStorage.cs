using Arkim.Application.DTO.Location;
using Arkim.Application.Services.Location;
using Arkim.Domain.Model.Location;
using Arkim.Infrastructure.Clients.DDB;

namespace Arkim.Infrastructure.RepositoryServices
{
	public class LocationStorage : ILocationStorage
	{
		private const string TABLE_NAME = "Locations";

		private readonly IDynamoClient _ddb;

		public LocationStorage(IDynamoClient ddb)
		{
			_ddb = ddb;
		}

		public async Task<IEnumerable<LocationBase>> ListCompanyLocationsAsync(string companyId)
			=> await _ddb.GetItemsAsync<LocationBase>(TABLE_NAME, companyId);

		public async Task<LocationRecordDto> GetLocationDetailsAsync(string companyId, string locationId)
			=> await _ddb.GetItemAsync<LocationRecordDto>(TABLE_NAME, companyId, locationId);

		public async Task UpsertLocationAsync(LocationRecordDto location)
			=> await _ddb.PutItemAsync(TABLE_NAME, location);

		public async Task DeleteLocationAsync(string companyId, string locationId)
			=> await _ddb.DeleteItemAsync(TABLE_NAME, companyId, locationId);
	}
}
