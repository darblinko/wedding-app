using Arkim.Application.DTO.User;
using Arkim.Application.Model;
using Arkim.Application.Services.User;
using Arkim.Domain.Model.User;
using Arkim.WebAPI.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace Arkim.WebAPI.Controllers
{
	[RequireSession(RequireAdmin = false)]
	[ApiController]
	[Route("api/users")]
	public class UsersController : ControllerBase
	{
		private readonly IUserService _users;

		public UsersController(IUserService users)
		{
			_users = users;
		}

		[HttpPatch]
		[Route("preferences/theme")]
		public async Task<OperationResult> SetPreferredThemeAsync([FromQuery] string theme)
			=> await _users.SetPreferredThemeAsync(theme);

		[HttpPatch]
		[Route("preferences/language")]
		public async Task<OperationResult> SetPreferredLanguageAsync([FromQuery] string language)
			=> await _users.SetPreferredLanguageAsync(language);

		[HttpPatch]
		[Route("preferences/location")]
		public async Task<OperationResult> SetPreferredDefaultLocationAsync([FromQuery] string locationId)
			=> await _users.SetPreferredDefaultLocationAsync(locationId);

		[HttpPatch]
		[Route("preferences/password")]
		public async Task<OperationResult> ResetCurrentUserPasswordAsync([FromBody] ResetPasswordDto resetDetails)
			=> await _users.ResetCurrentUserPasswordAsync(resetDetails);

		[HttpGet]
		[Route("list")]
		[RequireSession(RequireAdmin = true	)]
		public async Task<IEnumerable<UserBase>> ListCompanyUsersAsync([FromQuery] string search = "", [FromQuery] bool showInactive = false)
			=> await _users.ListUsersAsync(search, showInactive);

		[HttpGet]
		[RequireSession(RequireAdmin = true)]
		public async Task<UserDetails> GetByNameAsync([FromQuery] string userName)
			=> await _users.GetUserDetailsAsync(userName);

		[HttpPost]
		[RequireSession(RequireAdmin = true)]
		public async Task<OperationResult> CreateUserAsync([FromBody] UpsertUserDto user)
			=> await _users.CreateUserAsync(user);

		[HttpPatch]
		[RequireSession(RequireAdmin = true)]
		public async Task<OperationResult> UpdateUserAsync([FromBody] UpsertUserDto user)
			=> await _users.UpdateUserAsync(user);

		[HttpPatch]
		[Route("set/active")]
		[RequireSession(RequireAdmin = true)]
		public async Task<OperationResult> SetUserActiveAsync([FromQuery] string userName, [FromQuery] bool active)
			=> await _users.SetUserActiveAsync(userName, active);
	}
}
