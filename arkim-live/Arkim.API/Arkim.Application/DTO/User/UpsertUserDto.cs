using Arkim.Domain.Model.User;

namespace Arkim.Application.DTO.User
{
	public class UpsertUserDto : UserDetails
	{
		public string? Password { get; set; }
	}
}
