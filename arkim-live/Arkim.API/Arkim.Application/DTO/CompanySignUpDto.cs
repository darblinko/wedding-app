using Arkim.Application.DTO.Location;
using Arkim.Application.DTO.User;
using Arkim.Domain.Model.Company;
using Arkim.Domain.Model.Location;

namespace Arkim.Application.DTO
{
	public class CompanySignUpDto
	{
		private const string _defaultTheme = "light";
		private const string _defaultLanguage = "en";
		private const bool _useMetric = false;

		public string CompanyPin { get; set; }
		public string CompanyName { get; set; }
		public string Email { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string Password { get; set; }

		public CompanyDetails GetCompanyDetails()
		{
			return new CompanyDetails
			{
				Id = CompanyPin.Trim(),
				Name = CompanyName.Trim(),
				DefaultTheme = _defaultTheme,
				DefaultLanguage = _defaultLanguage,
				UseMetricSystem = _useMetric,
			};
		}

		public UpsertUserDto GetUserDetails()
		{
			return new UpsertUserDto
			{
				Email = Email.Trim(),
				FirstName = FirstName.Trim(),
				LastName = LastName.Trim(),
				Password = Password.Trim(),
				IsAdmin = true,
				IsActive = true,
				Language = _defaultLanguage,
				Theme = _defaultTheme,

			};
		}

		public LocationRecordDto GetDefaultLocation()
		{
			return new LocationRecordDto
			{
				Id = Guid.CreateVersion7().ToString(),
				Name = "Main",
				CompanyId = CompanyPin.Trim(),
				UseMetricSystem = _useMetric,
			};
		}
	}
}
