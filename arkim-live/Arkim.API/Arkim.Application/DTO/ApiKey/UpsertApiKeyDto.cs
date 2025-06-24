using Arkim.Domain.Model.ApiKey;

namespace Arkim.Application.DTO.ApiKey
{
	public class UpsertApiKeyDto : ApiKeyBase
	{
		public string Secret { get; set; }
	}
}
