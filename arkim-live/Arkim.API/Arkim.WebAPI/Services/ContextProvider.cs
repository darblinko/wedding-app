using Arkim.Application.DTO.Auth;
using Arkim.Application.Services;
using Arkim.Application.Services.Authentication;
using Arkim.Domain.Model.Company;
using Arkim.Domain.Model.User;

namespace Arkim.WebAPI.Services
{
	public class ContextProvider : IContextProvider
	{
		private readonly IHttpContextAccessor _contextAccessor;
		private readonly ISessionService _sessions;

		public ContextProvider(IHttpContextAccessor contextAccessor, ISessionService sessions)
		{
			_contextAccessor = contextAccessor;
			_sessions = sessions;
		}

		public SessionRecordDetails? GetSession()
			=> _contextAccessor.HttpContext?.Items["session"] as SessionRecordDetails;

		public string GetSessionId()
		{
			var session = GetSession();
			if (session == null)
			{
				throw new InvalidOperationException("User is not authenticated");
			}
			return session.Id;
		}

		public string GetCompanyId()
		{
			var session = GetSession();
			if (session == null)
			{
				throw new InvalidOperationException("User is not authenticated");
			}
			return session.Company.Id;
		}

		public CompanyDetails GetCompany()
		{
			var session = GetSession();
			if (session == null)
			{
				throw new InvalidOperationException("User is not authenticated");
			}
			return session.Company;
		}

		public string GetUserEmail()
		{
			var session = GetSession();
			if (session == null)
			{
				throw new InvalidOperationException("User is not authenticated");
			}
			return session.User.Email;
		}

		public UserDetails GetUserDetails()
		{
			var session = GetSession();
			if (session == null)
			{
				throw new InvalidOperationException("User is not authenticated");
			}
			return session.User;
		}

		public void Invalidate()
		{
			_sessions.InvalidateCache(GetSessionId());
		}
	}
}
