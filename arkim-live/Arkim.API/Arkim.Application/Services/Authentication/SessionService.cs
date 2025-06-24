using Arkim.Application.DTO.Auth;
using Arkim.Application.Model;
using Arkim.Application.Services.Company;
using Arkim.Application.Services.User;
using Arkim.Application.Utils;
using Arkim.Domain.Model.Authentication;
using Arkim.Domain.Model.Company;
using Arkim.Domain.Model.User;
using Microsoft.Extensions.Caching.Memory;

namespace Arkim.Application.Services.Authentication
{
	internal class SessionService : ISessionService
	{
		private const int SESSION_CACHE_EXPIRATION_MINUTES = 5;
		private const int SESSION_DURATION_INCREASE_MINUTES = 15;

		private readonly ISessionStorage _sessionStorage;
		private readonly IMemoryCache _cache;
		private readonly IUserStorage _users;
		private readonly ICompanyStorage _company;


		public SessionService(ISessionStorage sessionStorage, IMemoryCache cache, IUserStorage users, ICompanyStorage company)
		{
			_sessionStorage = sessionStorage;
			_cache = cache;
			_users = users;
			_company = company;
		}

		public async Task<SessionVerificationDto> VerifySessionAsync(string sessionId, bool requiredAdmin = false)
		{
			var result = new SessionVerificationDto
			{
				IsSuccess = false,
			};
			try
			{
				if (string.IsNullOrWhiteSpace(sessionId))
				{
					result.ErrorCode = OperationStatus.IncompleteData;
					result.ErrorMessage = "Session ID is empty";
					return result;
				}

				var cacheKey = GetCacheKey(sessionId);
				if (!_cache.TryGetValue(cacheKey, out SessionRecordDetails sessionDetails))
				{
					var sessionRecord = await _sessionStorage.GetSessionAsync(sessionId);
					if (sessionRecord == null)
					{
						result.ErrorCode = OperationStatus.NotFound;
						result.ErrorMessage = "Can't find session by ID";
						return result;
					}

					// Enrich with the details
					var company = await _company.GetCompanyAsync(sessionRecord.CompanyId);
					var user = await _users.GetUserAsync(sessionRecord.CompanyId, sessionRecord.UserEmail);
					sessionDetails = new SessionRecordDetails(sessionRecord, company, user);
					_cache.Set(cacheKey, sessionDetails, TimeSpan.FromMinutes(SESSION_CACHE_EXPIRATION_MINUTES));
				}

				// TODO: Replace DateTime.UtcNow with a clock service
				if (sessionDetails.ExpiresAtUtc < DateTime.UtcNow)
				{
					_cache.Remove(cacheKey);
					await _sessionStorage.DeleteSessionAsync(sessionId);
					result.ErrorCode = OperationStatus.Expired;
					result.ErrorMessage = "Session is expired";
					return result;
				}

				if (requiredAdmin && !sessionDetails.IsAdmin)
				{
					result.ErrorCode = OperationStatus.Unauthorized;
					result.ErrorMessage = "User is not an admin";
					return result;
				}

				// Increase the expiration time of the session if close to expiration
				if (sessionDetails.ExpiresAtUtc - DateTime.UtcNow < TimeSpan.FromMinutes(5))
				{
					sessionDetails.ExpiresAtUtc = DateTime.UtcNow.AddMinutes(SESSION_DURATION_INCREASE_MINUTES);
					_cache.Set(cacheKey, sessionDetails, TimeSpan.FromMinutes(SESSION_CACHE_EXPIRATION_MINUTES));
					await _sessionStorage.UpsertSessionAsync(sessionDetails);
				}

				result = TypeUtils.CloneWithCast<SessionVerificationDto>(sessionDetails);
				result.IsSuccess = true;
				return result;
			}
			catch (Exception ex)
			{
				result.ErrorCode = OperationStatus.UnhandledException;
				result.ErrorMessage = ex.Message;
				return result;
			}
		}

		public async Task<SessionRecordDetails> StartSessionAsync(CompanyDetails company, UserDetails user, bool longLasting = false)
		{
			string sessionId = null;

			// Verify there is no collision in 5 tries, if unsuccessful, return an error
			for (var i = 0; i < 5; i++)
			{
				var tempSessionId = Guid.CreateVersion7().ToString();
				if (await _sessionStorage.GetSessionAsync(tempSessionId) == null)
				{
					sessionId = tempSessionId;
					break;
				}
			}
			if (string.IsNullOrWhiteSpace(sessionId))
			{
				throw new Exception("Couldn't generate a unique session ID");
			}

			var session = new SessionRecord
			{
				Id = sessionId,
				CompanyId = company.Id,
				UserEmail = user.Email,
				IsAdmin = user.IsAdmin,
				CreatedAtUtc = DateTime.UtcNow,
				ExpiresAtUtc = longLasting
						? DateTime.UtcNow.AddDays(30)
						: DateTime.UtcNow.AddHours(4)
			};
			await _sessionStorage.UpsertSessionAsync(session);
			var details = new SessionRecordDetails(session, company, user);
			_cache.Set(GetCacheKey(sessionId), details, TimeSpan.FromMinutes(SESSION_CACHE_EXPIRATION_MINUTES));
			return details;
		}

		public async Task<OperationResult> RevokeSessionAsync(string sessionId)
		{
			try
			{
				var cacheKey = GetCacheKey(sessionId);
				if (_cache.TryGetValue(cacheKey, out SessionRecord session))
				{
					_cache.Remove(cacheKey);
				}
				await _sessionStorage.DeleteSessionAsync(sessionId);
				return new OperationResult();
			}
			catch (Exception ex)
			{
				return new OperationResult(ex);
			}
		}

		public void InvalidateCache(string sessionId)
		{
			var cacheKey = GetCacheKey(sessionId);
			if (_cache.TryGetValue(cacheKey, out SessionRecord session))
			{
				_cache.Remove(cacheKey);
			}
		}

		private string GetCacheKey(string sessionId)
		{
			return $"session.{sessionId}";
		}
	}
}
