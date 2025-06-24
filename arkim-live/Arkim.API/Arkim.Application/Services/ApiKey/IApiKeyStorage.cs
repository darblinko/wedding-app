using Arkim.Application.DTO.ApiKey;
using Arkim.Domain.Model.ApiKey;

namespace Arkim.Application.Services.ApiKey
{
	public interface IApiKeyStorage
	{
		Task<IEnumerable<ApiKeyBase>> ListApiKeysAsync(string companyId);
		Task<ApiKeyRecordDto?> GetApiKeyAsync(string accessKey);
		Task UpsertApiKeyAsync(ApiKeyRecordDto apiKey);
		Task DeleteApiKeyAsync(string accessKey);
	}
}
