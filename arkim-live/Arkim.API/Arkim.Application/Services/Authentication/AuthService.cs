using Arkim.Application.DTO;
using Arkim.Application.DTO.Auth;
using Arkim.Application.Model;
using Arkim.Application.Services.Company;
using Arkim.Application.Services.User;
using Arkim.Application.Utils;
using Arkim.Domain.Model.Authentication;
using Arkim.Domain.Model.User;

namespace Arkim.Application.Services.Authentication
{
	internal class AuthService : IAuthService
	{
		private readonly ISessionService _sessions;
		private readonly IUserService _userService;
		private readonly ICompanyStorage _company;
		private readonly IContextProvider _context;


		public AuthService(ISessionService sessions, IUserService userService, ICompanyStorage company, IContextProvider context)
		{
			_sessions = sessions;
			_userService = userService;
			_company = company;
			_context = context;
		}

		public async Task<LoginResult> SignInAsync(UserLoginDto userLogin)
		{
			try
			{
				var verifyPassword = await _userService.VerifyUserPasswordAsync(userLogin.CompanyId, userLogin.Email, userLogin.Password);
				if (!verifyPassword.IsSuccess)
				{
					return new LoginResult(verifyPassword);
				}
				var company = await _company.GetCompanyAsync(userLogin.CompanyId);
				var user = await _userService.GetUserDetailsAsync(userLogin.CompanyId, userLogin.Email);
				var newSession = await _sessions.StartSessionAsync(company, user, userLogin.LongLasting);
				var context = await GetSessionContextAsync(newSession);
				return new LoginResult(newSession.Id, context);
			}
			catch (Exception ex)
			{
				return new LoginResult(ex);
			}
		}

		public async Task<CurrentUserContextDto> GetCurrentSessionContextAsync()
			=> await GetSessionContextAsync(_context.GetSession());

		public async Task<CurrentUserContextDto> GetSessionContextAsync(SessionRecordDetails session)
		{
			return new CurrentUserContextDto
			{
				User = TypeUtils.CloneWithCast<UserDetails>(session.User),
				CompanyName = session.Company.Name,
				DefaultLanguage = session.Company.DefaultLanguage,
				DefaultTheme = session.Company.DefaultTheme,
				UseMetricSystem = session.Company.UseMetricSystem,
			};
		}

		public async Task<OperationResult> SignOffAsync()
		{
			var sessionId = _context.GetSessionId();
			if (string.IsNullOrWhiteSpace(sessionId))
			{
				return new OperationResult(OperationStatus.NotFound, "Session not found");
			}
			return await _sessions.RevokeSessionAsync(sessionId);
		}
	}
}
