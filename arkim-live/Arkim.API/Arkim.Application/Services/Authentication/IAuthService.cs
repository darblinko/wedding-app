using Arkim.Application.DTO;
using Arkim.Application.DTO.Auth;
using Arkim.Application.Model;
using Arkim.Domain.Model.Authentication;

namespace Arkim.Application.Services.Authentication
{
	public interface IAuthService
	{
		Task<LoginResult> SignInAsync(UserLoginDto userLogin);
		Task<CurrentUserContextDto> GetSessionContextAsync(SessionRecordDetails session);

		// Already authenticated in middleware methods for protected routes
		Task<CurrentUserContextDto> GetCurrentSessionContextAsync();
		Task<OperationResult> SignOffAsync();
	}
}
