using Arkim.Application.DTO;
using Arkim.Application.DTO.User;
using Arkim.Application.Model;
using Arkim.Application.Utils;
using Arkim.Domain.Model.User;
using System.ComponentModel.Design;

namespace Arkim.Application.Services.User
{
	public class UserService : IUserService
	{
		private readonly IContextProvider _context;
		private readonly IUserStorage _storage;

		public UserService(IContextProvider context, IUserStorage storage)
		{
			_context = context;
			_storage = storage;
		}

		public async Task<OperationResult> ValidateUserDataAsync(UpsertUserDto user, bool validatePassword = true)
		{
			// Email
			if (string.IsNullOrWhiteSpace(user.Email))
			{
				return new OperationResult(OperationStatus.IncompleteData, "userEmail");
			}
			var emailValidationResult = Validator.ValidateEmail(user.Email);
			if (!emailValidationResult.IsValid)
			{
				return new OperationResult(OperationStatus.BadRequest, emailValidationResult.ErrorMessage);
			}

			// Password
			if (validatePassword)
			{
				var passwordValidationResult = Validator.ValidatePassword(user.Password);
				if (!passwordValidationResult.IsValid)
				{
					return new OperationResult(OperationStatus.BadRequest, passwordValidationResult.ErrorMessage);
				}
			}

			return new OperationResult();
		}

		public async Task<OperationResult> CreateUserAsync(UpsertUserDto user)
		{
			var validationResult = await ValidateUserDataAsync(user, validatePassword: true);
			if (!validationResult.IsSuccess)
			{
				return validationResult;
			}

			// Check if the user already exists in the current company
			var companyId = _context.GetCompanyId();
			var existingUser = await _storage.GetUserAsync(companyId, user.Email);
			if (existingUser != null)
			{
				return new OperationResult(OperationStatus.AlreadyExists, "user");
			}

			// Create the user with the current user company ID
			return await CreateUserAsync(user, companyId);
		}

		public async Task<OperationResult> CreateUserAsync(UpsertUserDto user, string companyId)
		{
			try
			{
				var newRecord = TypeUtils.CloneWithCast<UserRecordDto>(user);
				newRecord.CompanyId = companyId;
				newRecord.HashedPassword = PasswordUtils.GetSaltedHashString(user.Password);
				await _storage.UpsertUserAsync(newRecord);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> DeleteUserAsync(string email)
		{
			try
			{
				// Check if the user exists and belongs to the same company
				var companyId = _context.GetCompanyId();
				var existingUser = await _storage.GetUserAsync(companyId, email);
				if (existingUser == null)
				{
					return new OperationResult(OperationStatus.NotFound, "user");
				}
				await _storage.DeleteUserAsync(companyId, email);

				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> SetPreferredThemeAsync(string theme)
			=> await UpdateUserPreferencePropertyAsync(user => user.Theme = theme);

		public async Task<OperationResult> SetPreferredLanguageAsync(string language)
			=> await UpdateUserPreferencePropertyAsync(user => user.Language = language);

		public async Task<OperationResult> SetPreferredDefaultLocationAsync(string locationId)
			=> await UpdateUserPreferencePropertyAsync(user => user.DefaultLocation = locationId);

		public async Task<OperationResult> VerifyUserPasswordAsync(string companyId, string email, string password)
		{
			try
			{
				var user = await _storage.GetUserAsync(companyId, email);
				if (user == null || !PasswordUtils.VerifyHash(password, user.HashedPassword))
				{
					return new OperationResult(OperationStatus.NotFound, "user");
				}
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}

		}

		public async Task<OperationResult> ResetCurrentUserPasswordAsync(ResetPasswordDto resetDetails)
		{
			try
			{
				// Try to auth with old password
				var companyId = _context.GetCompanyId();
				var user = await _storage.GetUserAsync(companyId, _context.GetUserEmail());
				var passwordVerificationResult = await VerifyUserPasswordAsync(user.CompanyId, user.Email, resetDetails.OldPassword);
				if (!passwordVerificationResult.IsSuccess)
				{
					return new OperationResult(OperationStatus.BadRequest, "oldPassword");
				}

				// Validate and reset
				var passwordValidationResult = Validator.ValidatePassword(resetDetails.NewPassword);
				if (!passwordValidationResult.IsValid)
				{
					return new OperationResult(OperationStatus.BadRequest, passwordValidationResult.ErrorMessage);
				}
				user.HashedPassword = PasswordUtils.GetSaltedHashString(resetDetails.NewPassword);
				await _storage.UpsertUserAsync(user);

				// TODO: Consider invalidating the other sessions

				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		private async Task<OperationResult> UpdateUserPreferencePropertyAsync(Action<UserRecordDto> propertyUpdater)
		{
			try
			{
				var user = await _storage.GetUserAsync(_context.GetCompanyId(), _context.GetUserEmail());
				propertyUpdater(user);
				await _storage.UpsertUserAsync(user);
				_context.Invalidate();
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<UserDetails> GetUserDetailsAsync(string companyId, string email)
		{
			var user = await _storage.GetUserAsync(companyId, email);
			return TypeUtils.CloneWithCast<UserDetails>(user);
		}

		public async Task<UserDetails> GetUserDetailsAsync(string email)
			=> await GetUserDetailsAsync(_context.GetCompanyId(), email);

		public async Task<IEnumerable<UserBase>> ListUsersAsync(string search, bool showInactive)
		{
			var users = await _storage.ListUsersAsync(_context.GetCompanyId());
			return users.Where(u =>
				(
					showInactive || u.IsActive
				) &&
				(
					string.IsNullOrWhiteSpace(search) ||
					(u.Email?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
					(u.FirstName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
					(u.LastName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
				)
			);
		}

		public async Task<OperationResult> UpdateUserAsync(UpsertUserDto user)
		{
			try
			{
				// Validate provided data
				var dataValidation = await ValidateUserDataAsync(user, validatePassword: !string.IsNullOrWhiteSpace(user.Password));
				if (!dataValidation.IsSuccess)
				{
					return dataValidation;
				}

				// Validate the user update
				var (updateValidation, existingUser) = await ValidateUserUpdateAsync(user.Email);
				if (!updateValidation.IsSuccess)
				{
					return updateValidation;
				}

				// Update the user in the storage
				var newRecord = TypeUtils.CloneWithCast<UserRecordDto>(user);
				newRecord.CompanyId = existingUser.CompanyId;
				// TODO: Consider invalidating the open sessions
				newRecord.HashedPassword = string.IsNullOrWhiteSpace(user.Password)
					? existingUser.HashedPassword
					: PasswordUtils.GetSaltedHashString(user.Password);
				await _storage.UpsertUserAsync(newRecord);

				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public async Task<OperationResult> SetUserActiveAsync(string email, bool active)
		{
			try
			{
				// Check if the user exists and belongs to the same company
				var (validationResult, existingUser) = await ValidateUserUpdateAsync(email);
				if (!validationResult.IsSuccess)
				{
					return validationResult;
				}
				// Update the user in the storage
				existingUser.IsActive = active;

				// TODO: Invalidate the open sessions if deactivated
				await _storage.UpsertUserAsync(existingUser);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		private async Task<(OperationResult result, UserRecordDto user)> ValidateUserUpdateAsync(string email)
		{
			// Check if the user exists and belongs to the same company
			var existingUser = await _storage.GetUserAsync(_context.GetCompanyId(), email);
			if (existingUser == null)
			{
				return (new OperationResult(OperationStatus.NotFound, "user"), null);
			}

			// Can't update the current user
			if (email == _context.GetCompanyId())
			{
				return (new OperationResult(OperationStatus.BadRequest, "currentUser"), null);
			}

			return (new OperationResult(), existingUser);
		}
	}
}
