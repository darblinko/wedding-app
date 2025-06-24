using Arkim.Application.DTO.User;
using Arkim.Application.Services.User;
using Arkim.Domain.Model.User;
using Arkim.Infrastructure.Clients.DDB;

namespace Arkim.Infrastructure.RepositoryServices
{
	public class UserStorage : IUserStorage
	{
		private const string TABLE_NAME = "Users";

		private readonly IDynamoClient _ddb;


		public UserStorage(IDynamoClient ddb)
		{
			_ddb = ddb;
		}

		public async Task<IEnumerable<UserBase>> ListUsersAsync(string companyId)
			=> await _ddb.GetItemsAsync<UserBase>(TABLE_NAME, companyId);

		public async Task<UserRecordDto> GetUserAsync(string companyId, string email)
			=> await _ddb.GetItemAsync<UserRecordDto>(TABLE_NAME, companyId, email);

		public async Task UpsertUserAsync(UserRecordDto user)
		{
			await _ddb.PutItemAsync(TABLE_NAME, user);
		}

		public async Task DeleteUserAsync(string companyId, string email)
			=> await _ddb.DeleteItemAsync(TABLE_NAME, companyId, email);
	}
}
