using Arkim.Application.DTO.Auth;
using Arkim.Application.Model;
using Arkim.Domain.Model.Company;
using Arkim.Domain.Model.User;

namespace Arkim.Application.Services.Authentication
{
	public interface ISessionService
	{
		Task<SessionVerificationDto> VerifySessionAsync(string sessionId, bool requiredAdmin = false);
		Task<SessionRecordDetails> StartSessionAsync(CompanyDetails company, UserDetails user, bool longLasting = false);
		Task<OperationResult> RevokeSessionAsync(string sessionId);
		void InvalidateCache(string sessionId);
	}
}
