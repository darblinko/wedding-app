namespace Arkim.Application.DTO.Auth
{
	public class UserLoginDto
	{
		public string CompanyId { get; set; }
		public string Email { get; set; }
		public string Password { get; set; }
		public bool LongLasting { get; set; }
	}
}
