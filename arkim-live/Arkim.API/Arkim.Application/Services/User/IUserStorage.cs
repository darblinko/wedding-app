using Arkim.Application.DTO.User;
using Arkim.Domain.Model.User;

namespace Arkim.Application.Services.User
{
	public interface IUserStorage
	{
		Task<IEnumerable<UserBase>> ListUsersAsync(string companyId);
		Task<UserRecordDto> GetUserAsync(string companyId, string email);
		Task UpsertUserAsync(UserRecordDto user);
		Task DeleteUserAsync(string companyId, string email);
	}
}
