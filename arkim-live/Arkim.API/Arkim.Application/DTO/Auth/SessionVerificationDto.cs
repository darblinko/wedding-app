using Arkim.Domain.Model.Authentication;

namespace Arkim.Application.DTO.Auth
{
	public class SessionVerificationDto : SessionRecordDetails
	{
		public bool IsSuccess { get; set; }
		public int ErrorCode { get; set; }
		public string ErrorMessage { get; set; }
	}
}
