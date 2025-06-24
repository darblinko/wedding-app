using Arkim.Domain.Model.ApiKey;

namespace Arkim.Application.DTO.ApiKey
{
	public class ApiKeyRecordDto : ApiKeyBase
	{
		public string CompanyId { get; set; }
		public string HashedSecret { get; set; }
	}
}
