namespace Arkim.Domain.Model.Company
{
	public class CompanyDetails : CompanyBase
	{
		public string? Address { get; set; }
		public string? Email { get; set; }
		public bool UseMetricSystem { get; set; }
		public string? DefaultTheme { get; set; }
		public string? DefaultLanguage { get; set; }
	}
}
