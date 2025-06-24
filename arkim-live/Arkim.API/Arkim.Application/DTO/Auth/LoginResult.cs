using Arkim.Application.Model;

namespace Arkim.Application.DTO.Auth
{
	public class LoginResult : OperationResult
	{
		public string SessionId { get; set; }
		public CurrentUserContextDto Context { get; set; }

		public LoginResult(string sessionId, CurrentUserContextDto context) : base()
		{
			SessionId = sessionId;
			Context = context;
		}

		public LoginResult(OperationResult operationResult) : base(operationResult.ErrorCode, operationResult.Message)
		{
		}

		public LoginResult(int errorCode, string message) : base(errorCode, message)
		{
		}

		public LoginResult(Exception ex) : base(ex)
		{
		}
	}
}
