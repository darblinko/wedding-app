using Arkim.Domain.Model.Authentication;

namespace Arkim.Application.Services.Authentication
{
	public interface ISessionStorage
	{
		Task<SessionRecord?> GetSessionAsync(string sessionId);
		Task UpsertSessionAsync(SessionRecord session);
		Task DeleteSessionAsync(string sessionId);
	}
}
