using Arkim.Domain.Model.User;

namespace Arkim.Application.DTO.User
{
	public class UserRecordDto : UserDetails
	{
		public string CompanyId { get; set; }
		public string HashedPassword { get; set; }
	}
}
