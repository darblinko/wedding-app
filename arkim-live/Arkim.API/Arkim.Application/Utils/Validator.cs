using System.Text.RegularExpressions;

namespace Arkim.Application.Utils
{
	internal static class Validator
	{
		private const int MinLength = 8;
		private const bool RequireUppercase = true;
		private const bool RequireLowercase = true;
		private const bool RequireNumbers = true;
		private const bool RequireSpecialChars = true;

		public static ValidationResult ValidatePassword(string password)
		{
			return ValidatePassword(password, MinLength, RequireUppercase, RequireLowercase, RequireNumbers, RequireSpecialChars);
		}

		public static ValidationResult ValidatePassword(
			string password,
			int minLength = MinLength,
			bool requireUppercase = RequireUppercase,
			bool requireLowercase = RequireLowercase,
			bool requireNumbers = RequireNumbers,
			bool requireSpecialChars = RequireSpecialChars)
		{
			var result = new ValidationResult();

			// Check for null or empty password
			if (string.IsNullOrEmpty(password))
			{
				result.AddError("Password cannot be empty.");
				return result;
			}

			// Check minimum length
			if (password.Length < minLength)
			{
				result.AddError($"Password must be at least {minLength} characters long.");
			}

			// Check for uppercase letters
			if (requireUppercase && !Regex.IsMatch(password, "[A-Z]"))
			{
				result.AddError("Password must contain at least one uppercase letter.");
			}

			// Check for lowercase letters
			if (requireLowercase && !Regex.IsMatch(password, "[a-z]"))
			{
				result.AddError("Password must contain at least one lowercase letter.");
			}

			// Check for numbers
			if (requireNumbers && !Regex.IsMatch(password, "[0-9]"))
			{
				result.AddError("Password must contain at least one number.");
			}

			// Check for special characters
			if (requireSpecialChars && !Regex.IsMatch(password, "[^a-zA-Z0-9]"))
			{
				result.AddError("Password must contain at least one special character.");
			}

			return result;
		}

		public static ValidationResult ValidateEmail(string email)
		{
			var result = new ValidationResult();
			if (string.IsNullOrEmpty(email))
			{
				result.AddError("Email cannot be empty.");
				return result;
			}
			var emailRegex = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
			if (!Regex.IsMatch(email, emailRegex))
			{
				result.AddError("Invalid email format.");
			}
			return result;
		}
	}

	public class ValidationResult
	{
		private readonly List<string> _errors = new List<string>();

		public bool IsValid => !_errors.Any();

		public IReadOnlyList<string> Errors => _errors.AsReadOnly();

		public string ErrorMessage => string.Join(" ", _errors);

		internal void AddError(string errorMessage)
		{
			_errors.Add(errorMessage);
		}
	}
}