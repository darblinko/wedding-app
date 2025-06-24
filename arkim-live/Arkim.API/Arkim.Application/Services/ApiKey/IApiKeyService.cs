using Arkim.Application.DTO.ApiKey;
using Arkim.Application.Model;
using Arkim.Domain.Model.ApiKey;

namespace Arkim.Application.Services.ApiKey
{
	public interface IApiKeyService
	{
		Task<IEnumerable<ApiKeyBase>> ListApiKeysAsync(string search);
		Task<UpsertApiKeyDto> GenerateApiKeyAsync(string description);
		Task<OperationResult> RevertApiKeyActiveAsync(string accessKey);
		Task<OperationResult> DeleteApiKeyAsync(string accessKey);
	}
}
