using Arkim.Application.DTO;
using Arkim.Application.DTO.User;
using Arkim.Application.Model;
using Arkim.Domain.Model.User;

namespace Arkim.Application.Services.User
{
	public interface IUserService
	{
		Task<OperationResult> ValidateUserDataAsync(UpsertUserDto user, bool validatePassword = true);

		// End point for the admin users
		Task<OperationResult> CreateUserAsync(UpsertUserDto user);

		// End point for company registration
		Task<OperationResult> CreateUserAsync(UpsertUserDto user, string companyId);

		Task<IEnumerable<UserBase>> ListUsersAsync(string search, bool showInactive);
		Task<UserDetails> GetUserDetailsAsync(string email);
		Task<UserDetails> GetUserDetailsAsync(string companyId, string email);
		Task<OperationResult> UpdateUserAsync(UpsertUserDto user);
		Task<OperationResult> SetPreferredThemeAsync(string theme);
		Task<OperationResult> SetPreferredLanguageAsync(string language);
		Task<OperationResult> SetPreferredDefaultLocationAsync(string locationId);
		Task<OperationResult> VerifyUserPasswordAsync(string companyId, string email, string password);
		Task<OperationResult> ResetCurrentUserPasswordAsync(ResetPasswordDto resetDetails);
		Task<OperationResult> DeleteUserAsync(string email);
		Task<OperationResult> SetUserActiveAsync(string email, bool active);
	}
}
