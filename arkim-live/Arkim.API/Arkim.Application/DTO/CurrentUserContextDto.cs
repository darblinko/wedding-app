using Arkim.Domain.Model.User;

namespace Arkim.Application.DTO
{
	public class CurrentUserContextDto
	{
		public UserDetails User { get; set; }
		public string CompanyName { get; set; }
		public string DefaultTheme { get; set; }
		public string DefaultLanguage { get; set; }
		public bool UseMetricSystem { get; set; }
	}
}
