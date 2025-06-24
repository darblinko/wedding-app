using Arkim.Application.DTO.ApiKey;
using Arkim.Application.Services.ApiKey;
using Arkim.Domain.Model.ApiKey;
using Arkim.Infrastructure.Clients.DDB;
using Arkim.Infrastructure.Model.DDB;

namespace Arkim.Infrastructure.RepositoryServices
{
	public class ApiKeyStorage : IApiKeyStorage
	{
		private const string TABLE_NAME = "ApiKeys";

		private readonly IDynamoClient _ddb;

		public ApiKeyStorage(IDynamoClient ddb)
		{
			_ddb = ddb;
		}

		public async Task<IEnumerable<ApiKeyBase>> ListApiKeysAsync(string companyId)
		{
			// We don't want a range key for the compan Id, since we are priorotizing the performance of the lookup by the access key
			// TODO: Consider adding a GSI for the companyId
			var filters = new List<FilterCondition> {
				new FilterCondition{ AttributeName = nameof(ApiKeyRecordDto.CompanyId), Operator = FilterOperator.Equal, Value = companyId }
			};
			return await _ddb.ScanAsync<ApiKeyBase>(TABLE_NAME, filters);
		}

		public async Task<ApiKeyRecordDto?> GetApiKeyAsync(string accessKey)
			=> await _ddb.GetItemAsync<ApiKeyRecordDto>(TABLE_NAME, accessKey);

		public async Task UpsertApiKeyAsync(ApiKeyRecordDto apiKey)
			=> await _ddb.PutItemAsync(TABLE_NAME, apiKey);

		public async Task DeleteApiKeyAsync(string accessKey)
			=> await _ddb.DeleteItemAsync(TABLE_NAME, accessKey);
	}
}
