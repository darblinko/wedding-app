using Arkim.Application.Services.Authentication;
using Arkim.Domain.Model.Authentication;
using Arkim.Infrastructure.Clients.DDB;

namespace Arkim.Infrastructure.RepositoryServices
{
	internal class SessionStorage : ISessionStorage
	{
		private const string TABLE_NAME = "Sessions";

		private readonly IDynamoClient _ddb;

		public SessionStorage(IDynamoClient ddb)
		{
			_ddb = ddb;
		}

		public async Task<SessionRecord?> GetSessionAsync(string sessionId)
			=> await _ddb.GetItemAsync<SessionRecord>(TABLE_NAME, sessionId);

		public async Task UpsertSessionAsync(SessionRecord session)
			=> await _ddb.PutItemAsync(TABLE_NAME, session);

		public async Task DeleteSessionAsync(string sessionId)
			=> await _ddb.DeleteItemAsync(TABLE_NAME, sessionId);
	}
}
