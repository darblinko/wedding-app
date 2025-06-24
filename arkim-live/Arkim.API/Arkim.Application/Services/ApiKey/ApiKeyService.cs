using Arkim.Application.DTO.ApiKey;
using Arkim.Application.Model;
using Arkim.Application.Services.ApiKey;
using Arkim.Application.Utils;
using Arkim.Domain.Model.ApiKey;

namespace Arkim.Application.Services.Location
{
	public class ApiKeyService : IApiKeyService
	{
		private readonly IApiKeyStorage _storage;
		private readonly IContextProvider _context;

		public ApiKeyService(IApiKeyStorage storage, IContextProvider context)
		{
			_storage = storage;
			_context = context;
		}

		public async Task<IEnumerable<ApiKeyBase>> ListApiKeysAsync(string search)
		{
			var keys = await _storage.ListApiKeysAsync(_context.GetCompanyId());
			return keys.Where(k =>
				string.IsNullOrWhiteSpace(search) ||
				(k.AccessKey?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
				(k.Description?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
			);
		}

		public async Task<UpsertApiKeyDto> GenerateApiKeyAsync(string description)
		{

			try
			{
				// Access key should be a unique, but relitevely short string
				var accessKey = await GenerateNewAccessKey();
				var secret = PasswordUtils.GenerateRandomString(30, true);

				// Generate a new API key
				var apiKey = new UpsertApiKeyDto
				{
					AccessKey = accessKey,
					Description = description,
					IsActive = true,
					Secret = secret,
				};

				// Hash and store
				var apiKeyRecord = TypeUtils.CloneWithCast<ApiKeyRecordDto>(apiKey);
				apiKeyRecord.CompanyId = _context.GetCompanyId();
				apiKeyRecord.HashedSecret = PasswordUtils.GetSaltedHashString(secret);
				apiKeyRecord.CreatedAtUtc = DateTime.UtcNow;
				await _storage.UpsertApiKeyAsync(apiKeyRecord);
				return apiKey;
			}
			catch (Exception ex)
			{
				return new UpsertApiKeyDto
				{
					IsActive = false,
					Description = ex.Message,
				};
			}
		}

		public async Task<OperationResult> RevertApiKeyActiveAsync(string accessKey)
		{
			var companyId = _context.GetCompanyId();
			var apiKey = await _storage.GetApiKeyAsync(accessKey);
			if (apiKey == null || apiKey.CompanyId != companyId)
			{
				return new OperationResult(OperationStatus.NotFound, "API key not found");
			}
			try
			{
				apiKey.IsActive = !apiKey.IsActive;
				await _storage.UpsertApiKeyAsync(apiKey);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> DeleteApiKeyAsync(string accessKey)
		{
			var companyId = _context.GetCompanyId();
			var apiKey = await _storage.GetApiKeyAsync(accessKey);
			if (apiKey == null || apiKey.CompanyId != companyId)
			{
				return new OperationResult(OperationStatus.NotFound, "API key not found");
			}
			try
			{
				await _storage.DeleteApiKeyAsync(accessKey);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		private async Task<string> GenerateNewAccessKey()
		{
			// If we can't work around the collision in 10 iterations, then probably something fundomental is wrong here
			for (var i = 0; i < 10; i++)
			{
				var accessKey = PasswordUtils.GenerateRandomString(10);
				var existingKey = await _storage.GetApiKeyAsync(accessKey);
				if (existingKey == null)
				{
					return accessKey;
				}
			}
			throw new Exception("Couldn't generate unique access key!");
		}
	}
}
