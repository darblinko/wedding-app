using Arkim.Application.DTO;
using Arkim.Application.DTO.Auth;
using Arkim.Application.Model;
using Arkim.Application.Services.Authentication;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession]
	[ApiController]
	[Route("api/auth")]
	public class AuthenticationController : ControllerBase
	{
		private readonly IAuthService _auth;

		public AuthenticationController(IAuthService auth)
		{
			_auth = auth;
		}

		[AllowAnonymous]
		[HttpPost]
		[Route("signin")]
		public async Task<LoginResult> GetCurrentUserContextAsync([FromBody] UserLoginDto loginDto)
			=> await _auth.SignInAsync(loginDto);

		[HttpGet]
		[Route("context")]
		public async Task<CurrentUserContextDto> GetCurrentUserContextAsync()
			=> await _auth.GetCurrentSessionContextAsync();

		[HttpDelete]
		[Route("signoff")]
		public async Task<OperationResult> SetPreferredThemeAsync()
			=> await _auth.SignOffAsync();
	}
}
