using Arkim.Application.DTO.ApiKey;
using Arkim.Application.Model;
using Arkim.Application.Services.ApiKey;
using Arkim.Domain.Model.ApiKey;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession(RequireAdmin = true)]
	[ApiController]
	[Route("api/api_keys")]
	public class ApiKeysController : ControllerBase
	{
		private readonly IApiKeyService _service;

		public ApiKeysController(IApiKeyService service)
		{
			_service = service;
		}

		[HttpGet]
		[Route("list")]
		public async Task<IEnumerable<ApiKeyBase>> ListCompanyApiKeysAsync([FromQuery] string search = "")
			=> await _service.ListApiKeysAsync(search);

		[HttpPost]
		[Route("generate")]
		public async Task<UpsertApiKeyDto> GenerateApiKeyAsync([FromBody] string? description = "")
			=> await _service.GenerateApiKeyAsync(description);

		[HttpPatch]
		[Route("revert_active")]
		public async Task<OperationResult> RevertApiKeyActiveAsync([FromQuery] string accessKey)
			=> await _service.RevertApiKeyActiveAsync(accessKey);

		[HttpDelete]
		public async Task<OperationResult> DeleteApiKeyAsync([FromQuery] string accessKey)
			=> await _service.DeleteApiKeyAsync(accessKey);
	}
}
